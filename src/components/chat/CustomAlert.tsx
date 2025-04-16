'use client';
import chatView from '@/styles/chatView.module.css';

export default function CustomAlert({ text }: { text: string }) {
    const now = new Date();
    const formattedDateTime = now.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });

    return (
        <div className="d-flex justify-content-center mb-2">
            <div className={`px-2 py-0 d-flex flex-inline ${chatView.custom_alert}`} style={{ maxWidth: '80%' }}>
                <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px', textAlign: 'right' }}>{text}</div>
                <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px', textAlign: 'right' }}>
                    {formattedDateTime}
                </div>
            </div>
        </div>
    );
}
