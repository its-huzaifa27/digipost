import React from 'react';
import { Button } from '../../ui/Button';

export function SocialAccountList({ accounts, onConnect, onDisconnect, onTogglePost }) {
    return (
        <div className="space-y-6">
            {/* Connection Management */}
            <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Manage Connected Accounts:
                </label>
                <div className="space-y-3">
                    {accounts.map((account) => (
                        <div
                            key={account.id}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-white"
                        >
                            <div className="flex items-center space-x-3">
                                {/* Platform Icon */}
                                <div className={`w-10 h-10 bg-linear-to-tr ${account.color} rounded-lg flex items-center justify-center shrink-0`}>
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        {account.icon}
                                    </svg>
                                </div>

                                {/* Platform Info */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        {account.name}
                                    </h3>
                                    {account.connected ? (
                                        <p className="text-xs text-green-600 font-medium flex items-center">
                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Connected • {account.username}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-gray-500">
                                            Not connected
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Connect/Disconnect Button */}
                            {account.connected ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onDisconnect(account.id)}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700"
                                >
                                    Disconnect
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => onConnect(account.id)}
                                >
                                    Connect
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Selection for Posting */}
            <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Select Platforms to Post:
                </label>
                <div className="space-y-2">
                    {accounts
                        .filter(account => account.connected)
                        .map((account) => (
                            <div key={account.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg bg-white">
                                <input
                                    type="checkbox"
                                    id={`post-${account.id}`}
                                    defaultChecked={account.id === 'instagram'} // Default logic could be lifted up if needed
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                />
                                <label htmlFor={`post-${account.id}`} className="flex items-center cursor-pointer flex-1">
                                    <div className={`w-8 h-8 bg-linear-to-tr ${account.color} rounded-lg flex items-center justify-center mr-3`}>
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            {account.icon}
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="text-gray-900 font-medium text-sm">{account.name}</span>
                                        <p className="text-xs text-gray-500">{account.username}</p>
                                    </div>
                                </label>
                            </div>
                        ))}
                    {accounts.filter(account => account.connected).length === 0 && (
                        <p className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg">
                            No connected accounts. Please connect at least one account above to post.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
