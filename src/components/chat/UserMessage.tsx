'use client';
import chatView from '@/styles/chatView.module.css'

export default function UserMessage({ text }: { text: string }) {
    return (
        <div className="d-flex justify-content-end mb-2">
            <div className={`p-2 ${chatView.user_message}`} style={{ maxWidth: '75%' }}>
                {text}
            </div>
        </div>
    );
}
