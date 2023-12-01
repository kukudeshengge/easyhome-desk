import { Checkbox, Input, Select, Space, Button, notification, Table, Progress } from 'antd';
import { SendOutlined, LoadingOutlined } from '@ant-design/icons';
import React from 'react';
import { sendChatGPTStream } from '../api/chatGPT';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax';
import { Prism } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

import styles from '../styles/ehchat.module.scss';

interface IMessageItem {
    msg: string;
    role: 'system' | 'user';
}
export default class EHChat extends React.Component {
    state = {
        message: '',
        msglist: [] as IMessageItem[],
        sending: false,
    };
    render() {
        const { msglist, sending, message } = this.state;
        const { onSend, onKeyDown, setMessage } = this;
        return (
            <div className={styles.ehchat}>
                <div id="chat" className={styles.container}>
                    {msglist.map((item, index) => (
                        <div className={item.role === 'system' ? styles.userItem : styles.userItem2} key={index}>
                            {item.role === 'system' && <div className={styles.aichat}>AI</div>}
                            <div className={styles.markdown}>
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkMath]}
                                    rehypePlugins={[rehypeMathjax]}
                                    components={{
                                        code({ node, inline, className, children, ...props }: any) {
                                            const match = /language-(\w+)/.exec(className || '');
                                            return !inline ? (
                                                <Prism language={(match && match[1]) || ''} style={oneDark}>
                                                    {children}
                                                </Prism>
                                            ) : (
                                                <code className={className} {...props}>
                                                    {children}
                                                </code>
                                            );
                                        },
                                        table({ children }: any) {
                                            return <table className="border-collapse border border-black px-3 py-1 ">{children}</table>;
                                        },
                                        th({ children }: any) {
                                            return <th className="break-words border border-black bg-gray-500 px-3 py-1 text-white">{children}</th>;
                                        },
                                        td({ children }: any) {
                                            return <td className="break-words border border-black px-3 py-1 ">{children}</td>;
                                        },
                                    }}
                                >
                                    {item.msg}
                                </ReactMarkdown>
                            </div>
                            {item.role === 'user' && <div className={styles.mechat}>我</div>}
                        </div>
                    ))}
                </div>
                <div className={styles.footer}>
                    <Input.TextArea
                        disabled={sending}
                        className={styles.footer_text}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onPressEnter={onSend}
                        onKeyDown={onKeyDown}
                        autoFocus
                        maxLength={100}
                    ></Input.TextArea>
                    <div className={message.length > 0 && !sending ? styles.footer_btn : styles.footer_btn2} onClick={onSend}>
                        {!sending && <SendOutlined />}
                        {sending && <LoadingOutlined />}
                    </div>
                </div>
            </div>
        );
    }

    onSend = async () => {
        const { sending, message, msglist } = this.state;
        if (sending) return;
        if (!message) return;
        msglist.push({ msg: message, role: 'user' });
        this.setState({ sending: true });

        try {
            msglist.push({ msg: '', role: 'system' });
            await sendChatGPTStream(message, this.setContent, this.onDone);
        } catch (error) {
            console.log(error);
            this.setState({ sending: false });
        }
    };
    setContent = (id: string, content: string) => {
        const { msglist } = this.state;
        msglist[msglist.length - 1].msg += content;
        this.forceUpdate();
    };
    onDone = () => {
        this.setState({ message: '', sending: false });
    };
    onKeyDown(e: any) {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    }
    setMessage = (message: string) => {
        this.setState({ message });
    };
}
