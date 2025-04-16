'use client';
import { IoCopy } from 'react-icons/io5'; 
import chatView from '@/styles/chatView.module.css';
import { useState } from 'react';

export default function BotMessage({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };

    return (
        <div className="d-flex justify-content-start mb-2">
            <div
                className={`p-2 ${chatView.bot_message}`}
                style={{ maxWidth: '75%', position: 'relative' }}
            >
                <div
                    dangerouslySetInnerHTML={{ __html: text }}
                    className={`prose prose-sm  ${chatView.formatStyles}`}
                />
                <IoCopy
                    onClick={handleCopy}
                    style={{
                        cursor: 'pointer',
                        marginLeft: '10px',
                        color: copied ? 'green' : '#333',
                        position: 'absolute',
                        top: 5,
                        right: 5,
                    }}
                    title="Copy to clipboard"
                />
            </div>
        </div>
    );
}
