import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { Send, MessageSquare, Shield, Clock } from 'lucide-react';

const GroupChat = ({ groupId, senderName, senderRole }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    if (!groupId) return;
    try {
      const res = await api.get(`/community-groups/${groupId}/messages`);
      setMessages(res.data || []);
    } catch (err) {
      console.error('Error fetching group messages:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || submitting) return;

    setSubmitting(true);
    try {
      await api.post(
        `/community-groups/${groupId}/messages?senderName=${encodeURIComponent(senderName)}&senderRole=${senderRole}`,
        newMessage.trim()
      );
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-5 flex flex-col h-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#8b5cf6]" />
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm">Team Collaboration Chat</h4>
            <p className="text-[10px] text-slate-500 font-mono">Channel updates live</p>
          </div>
        </div>
        <span className="text-[10px] bg-purple-100 text-[#7c3aed] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          {senderRole === 'LEADER' ? '👑 Group Leader' : '👤 Team Member'}
        </span>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 scrollbar-thin">
        {messages.length > 0 ? (
          messages.map((m) => {
            const isMe = m.senderName === senderName;
            const isLeaderMsg = m.senderRole === 'LEADER';
            return (
              <div
                key={m.id}
                className={`flex flex-col max-w-[80%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
              >
                {/* Sender Info */}
                <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-0.5 px-1 font-mono">
                  {isLeaderMsg && <Shield className="w-3 h-3 text-amber-500 fill-amber-500" />}
                  <span className={`font-bold ${isLeaderMsg ? 'text-amber-700' : 'text-slate-700'}`}>
                    {m.senderName}
                  </span>
                  <span>({isLeaderMsg ? 'Leader' : 'Member'})</span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-[#8b5cf6] text-white rounded-tr-none'
                      : isLeaderMsg
                      ? 'bg-amber-50 border border-amber-200 text-slate-800 rounded-tl-none font-medium'
                      : 'bg-slate-100 text-slate-800 rounded-tl-none'
                  }`}
                >
                  {m.message}
                </div>

                {/* Timestamp */}
                <span className="text-[9px] text-slate-400 font-mono mt-0.5 px-1 flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                </span>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-10 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-300" />
            <p>No messages yet. Send a greeting to start collaborating!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 shrink-0 flex items-center gap-2">
        <input
          type="text"
          placeholder="Type your message here..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={submitting}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#8b5cf6] text-xs text-slate-800"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || submitting}
          className="p-2.5 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default GroupChat;
