import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa6';
import { clsx } from 'clsx';

export const DropdownItem = ({ title, description, children, icon: Icon }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-200 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center gap-3">
                    {Icon && <Icon className="text-indigo-600 text-xl" />}
                    <div className="text-left">
                        <h3 className="font-semibold text-gray-900">{title}</h3>
                        {description && <p className="text-sm text-gray-500">{description}</p>}
                    </div>
                </div>
                <FaChevronDown
                    className={clsx(
                        'text-gray-400 transition-transform duration-300',
                        isOpen && 'rotate-180'
                    )}
                />
            </button>

            <div
                className={clsx(
                    'overflow-hidden transition-all duration-300 ease-in-out',
                    isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                )}>
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                    {children}
                </div>
            </div>
        </div>
    );
};
