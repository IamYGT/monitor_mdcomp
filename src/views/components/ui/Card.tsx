import React, { ReactNode } from 'react';

interface CardProps {
    title?: string;
    children: ReactNode;
    actions?: ReactNode;
    className?: string;
    bodyClassName?: string;
    noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({
    title,
    children,
    actions,
    className = '',
    bodyClassName = '',
    noPadding = false
}) => {
    return (
        <div className={`bg-gray-800 border-0 rounded-xl mb-6 shadow-md transition-all hover:shadow-lg overflow-hidden ${className}`}>
            {title && (
                <div className="bg-gray-900/30 border-b border-gray-700 text-emerald-500 py-4 px-6 font-semibold flex justify-between items-center">
                    <span>{title}</span>
                    {actions && <div>{actions}</div>}
                </div>
            )}
            <div className={`${noPadding ? '' : 'p-6'} ${bodyClassName}`}>
                {children}
            </div>
        </div>
    );
};

export default Card; 