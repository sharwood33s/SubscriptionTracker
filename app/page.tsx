"use client";

import { useMemo } from "react";

type Subscription = {
  id: number;
  name: string;
  price: number;
};

export default function Home() {
  const subscriptions: Subscription[] = [
    { id: 1, name: "Netflix", price: 1490 },
    { id: 2, name: "ChatGPT", price: 3000 },
    { id: 3, name: "iCloud", price: 400 },
  ];

  const totalMonthly = useMemo(() => {
    return subscriptions.reduce((sum, sub) => sum + sub.price, 0);
  }, [subscriptions]);

  const totalYearly = totalMonthly * 12;

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">サブスク管理</h1>

      <div className="space-y-2">
        {subscriptions.map((sub) => (
          <div
            key={sub.id}
            className="flex justify-between border p-3 rounded-lg"
          >
            <span>{sub.name}</span>
            <span>¥{sub.price.toLocaleString()} / 月</span>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t pt-4">
        <p className="text-lg">
          月額合計：¥{totalMonthly.toLocaleString()}
        </p>
        <p className="text-lg">
          年間合計：¥{totalYearly.toLocaleString()}
        </p>
      </div>
    </main>
  );
}