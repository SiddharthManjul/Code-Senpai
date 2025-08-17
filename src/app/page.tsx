/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import DevChatInterface from "@/components/chatInterface";
import { DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useAccount, useBalance } from 'wagmi';

export default function Home() {
  const { user } = useDynamicContext();
  const isAuthenticated = !!user;

  return (
    <main className="">
      <DynamicWidget />
      {isAuthenticated ? (
        <DevChatInterface />
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-500">
            Please connect your wallet to access the chat interface
          </p>
        </div>
      )}
    </main>
  );
}