"use client";

import { useMemo, useState, useSyncExternalStore } from "react";

type Subscription = {
  id: number;
  name: string;
  price: number;
  category: string;
  renewalDate: string;
  memo: string;
};

const STORAGE_KEY = "subscriptions";
const STORAGE_UPDATE_EVENT = "subscriptions-updated";
const EMPTY_SUBSCRIPTIONS: Subscription[] = [];

let cachedRawSubscriptions: string | null = null;
let cachedSubscriptions: Subscription[] = EMPTY_SUBSCRIPTIONS;

const parseSubscriptions = (value: string | null): Subscription[] => {
  if (!value) {
    return EMPTY_SUBSCRIPTIONS;
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return EMPTY_SUBSCRIPTIONS;
    }

    return parsed.filter((subscription): subscription is Subscription => {
      return (
        typeof subscription?.id === "number" &&
        typeof subscription.name === "string" &&
        typeof subscription.price === "number" &&
        typeof subscription.category === "string" &&
        typeof subscription.renewalDate === "string" &&
        typeof subscription.memo === "string"
      );
    });
  } catch {
    return EMPTY_SUBSCRIPTIONS;
  }
};

const getStoredSubscriptions = () => {
  if (typeof window === "undefined") {
    return EMPTY_SUBSCRIPTIONS;
  }

  const rawSubscriptions = window.localStorage.getItem(STORAGE_KEY);

  if (rawSubscriptions === cachedRawSubscriptions) {
    return cachedSubscriptions;
  }

  cachedRawSubscriptions = rawSubscriptions;
  cachedSubscriptions = parseSubscriptions(rawSubscriptions);

  return cachedSubscriptions;
};

const subscribeToStoredSubscriptions = (onStoreChange: () => void) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(STORAGE_UPDATE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(STORAGE_UPDATE_EVENT, onStoreChange);
  };
};

const saveSubscriptions = (subscriptions: Subscription[]) => {
  const rawSubscriptions = JSON.stringify(subscriptions);

  cachedRawSubscriptions = rawSubscriptions;
  cachedSubscriptions = subscriptions;
  window.localStorage.setItem(STORAGE_KEY, rawSubscriptions);
  window.dispatchEvent(new Event(STORAGE_UPDATE_EVENT));
};

export default function Home() {
  const subscriptions = useSyncExternalStore(
    subscribeToStoredSubscriptions,
    getStoredSubscriptions,
    () => EMPTY_SUBSCRIPTIONS,
  );
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [memo, setMemo] = useState("");

  const totalMonthly = useMemo(() => {
    return subscriptions.reduce((sum, sub) => sum + sub.price, 0);
  }, [subscriptions]);

  const totalYearly = totalMonthly * 12;

  const addSubscription = () => {
    if (!name || !price) return;

    const newSubscription: Subscription = {
      id: Date.now(),
      name,
      price: Number(price),
      category,
      renewalDate,
      memo,
    };

    saveSubscriptions([...subscriptions, newSubscription]);
    setName("");
    setPrice("");
    setCategory("");
    setRenewalDate("");
    setMemo("");
  };

  const deleteSubscription = (id: number) => {
    saveSubscriptions(subscriptions.filter((sub) => sub.id !== id));
  };

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">サブスク管理</h1>

      <div className="border p-4 rounded-lg mb-6 space-y-3">
        <input
          className="w-full border p-2 rounded"
          placeholder="サブスク名"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="月額料金"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="カテゴリ（例：AI、動画、クラウド）"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          type="date"
          value={renewalDate}
          onChange={(e) => setRenewalDate(e.target.value)}
        />

        <textarea
          className="w-full border p-2 rounded"
          placeholder="メモ"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />

        <button
          className="w-full bg-black text-white p-2 rounded"
          onClick={addSubscription}
        >
          追加
        </button>
      </div>

      <div className="space-y-3">
        {subscriptions.map((sub) => (
          <div key={sub.id} className="border p-4 rounded-lg">
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="font-bold">{sub.name}</p>
                <p className="text-sm text-gray-500">
                  ¥{sub.price.toLocaleString()} / 月
                </p>
                {sub.category && (
                  <p className="text-sm">カテゴリ：{sub.category}</p>
                )}
                {sub.renewalDate && (
                  <p className="text-sm">更新日：{sub.renewalDate}</p>
                )}
                {sub.memo && <p className="text-sm mt-2">メモ：{sub.memo}</p>}
              </div>

              <button
                className="text-red-500 hover:underline"
                onClick={() => deleteSubscription(sub.id)}
              >
                削除
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t pt-4">
        <p className="text-lg">月額合計：¥{totalMonthly.toLocaleString()}</p>
        <p className="text-lg">年間合計：¥{totalYearly.toLocaleString()}</p>
      </div>
    </main>
  );
}
