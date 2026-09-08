import { useState, useEffect, useRef, useMemo } from "react";
import {
  MessageSquare,
  Send,
  Sparkles,
  Pin,
  Smile,
  Paperclip,
  Trash2,
  Copy,
  Check,
  Search,
  Users,
  Megaphone,
  MoreVertical,
  Volume2,
  Image as ImageIcon,
  CheckCheck,
  Clock,
  Info,
  Database,
  Code2,
  RefreshCw,
} from "lucide-react";
import { supabase } from "../../../shared/api/supabaseClient";
import { Avatar } from "../../../shared/components/primitives";
import { displayPhone } from "../utils/helpers";

const QUICK_EMOJIS = ["👍", "❤️", "🔥", "👏", "🎯", "✅", "🚀", "📚"];

export function GroupChatSection({
  group,
  students = [],
  appData,
  directorData,
}) {
  const teacher = appData?.currentUser || appData?.teacher || {
    id: group?.teacherHrId || group?.teacherId || "teacher",
    name: group?.teacherName || "Ustoz",
    role: "teacher",
  };

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState(null);
  const [selectedEmojiFor, setSelectedEmojiFor] = useState(null);
  const [dbError, setDbError] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const groupId = String(group?.id || "");

  // Scroll to bottom
  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  // Fetch messages from Supabase
  const fetchMessages = async () => {
    if (!groupId) return;
    try {
      setLoading(true);
      setDbError(null);
      const { data, error } = await supabase
        .from("group_messages")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: true });

      if (error) {
        // If table doesn't exist yet, we capture error and use demo/cached messages
        console.warn("Supabase group_messages notice:", error.message);
        setDbError(error.message);
        // Fallback demo/initial messages for instant UX
        setMessages((prev) => {
          if (prev.length > 0) return prev;
          return [
            {
              id: "welcome-msg",
              group_id: groupId,
              sender_id: String(teacher.id),
              sender_name: teacher.name || "Ustoz",
              sender_role: "teacher",
              sender_avatar: teacher.avatar || teacher.photo || null,
              content: `Assalomu alaykum hurmatli "${group.name}" guruhi o'quvchilari! Ushbu chat orqali darslar, vazifalar va muhim e'lonlarni muhokama qilamiz.`,
              is_announcement: true,
              is_pinned: true,
              reactions: { "👍": [String(teacher.id)] },
              created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
            },
          ];
        });
      } else if (data) {
        setMessages(data);
      }
    } catch (err) {
      console.error("Chat fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and Realtime listener
  useEffect(() => {
    fetchMessages();

    // Supabase Realtime Channel
    const channel = supabase
      .channel(`group-chat-${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "group_messages",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setMessages((prev) => {
              if (prev.some((m) => m.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
            setTimeout(() => scrollToBottom(true), 100);
          } else if (payload.eventType === "UPDATE") {
            setMessages((prev) =>
              prev.map((m) => (m.id === payload.new.id ? payload.new : m))
            );
          } else if (payload.eventType === "DELETE") {
            setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  useEffect(() => {
    if (!loading) {
      scrollToBottom(false);
    }
  }, [loading]);

  // Send message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const text = inputText.trim();
    if (!text || sending || !groupId) return;

    setSending(true);

    const newMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      group_id: groupId,
      sender_id: String(teacher.id || "teacher"),
      sender_name: teacher.name || "Ustoz",
      sender_role: "teacher",
      sender_avatar: teacher.avatar || teacher.photo || null,
      content: text,
      is_announcement: isAnnouncement,
      is_pinned: false,
      reactions: {},
      created_at: new Date().toISOString(),
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
    setIsAnnouncement(false);
    setTimeout(() => scrollToBottom(true), 50);

    try {
      const { data, error } = await supabase
        .from("group_messages")
        .insert([newMessage])
        .select()
        .single();

      if (error) {
        console.warn("Could not persist to Supabase group_messages table:", error.message);
        setDbError(error.message);
      } else if (data) {
        // update with server record if needed
        setMessages((prev) =>
          prev.map((m) => (m.id === newMessage.id ? data : m))
        );
      }
    } catch (err) {
      console.error("Send error:", err);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // Toggle Pin message
  const handleTogglePin = async (msg) => {
    const updatedPinned = !msg.is_pinned;
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, is_pinned: updatedPinned } : m))
    );

    try {
      await supabase
        .from("group_messages")
        .update({ is_pinned: updatedPinned })
        .eq("id", msg.id);
    } catch (err) {
      console.warn("Pin update error:", err);
    }
  };

  // Delete message
  const handleDeleteMessage = async (msgId) => {
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
    try {
      await supabase.from("group_messages").delete().eq("id", msgId);
    } catch (err) {
      console.warn("Delete message error:", err);
    }
  };

  // Add Emoji Reaction
  const handleToggleReaction = async (msg, emoji) => {
    const userId = String(teacher.id || "teacher");
    const currentReactions = msg.reactions || {};
    const userList = currentReactions[emoji] || [];
    let updatedList;

    if (userList.includes(userId)) {
      updatedList = userList.filter((id) => id !== userId);
    } else {
      updatedList = [...userList, userId];
    }

    const nextReactions = { ...currentReactions };
    if (updatedList.length > 0) {
      nextReactions[emoji] = updatedList;
    } else {
      delete nextReactions[emoji];
    }

    setMessages((prev) =>
      prev.map((m) =>
        m.id === msg.id ? { ...m, reactions: nextReactions } : m
      )
    );
    setSelectedEmojiFor(null);

    try {
      await supabase
        .from("group_messages")
        .update({ reactions: nextReactions })
        .eq("id", msg.id);
    } catch (err) {
      console.warn("Reaction update error:", err);
    }
  };

  // Copy message text
  const handleCopy = (msg) => {
    navigator.clipboard.writeText(msg.content);
    setCopiedMsgId(msg.id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Pinned announcements list
  const pinnedMessages = useMemo(() => {
    return messages.filter((m) => m.is_pinned);
  }, [messages]);

  // Filtered messages
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase().trim();
    return messages.filter(
      (m) =>
        (m.content || "").toLowerCase().includes(q) ||
        (m.sender_name || "").toLowerCase().includes(q)
    );
  }, [messages, searchQuery]);

  // Format timestamp (e.g., 14:20 or Kecha 18:45)
  const formatMsgTime = (isoString) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      const hours = String(d.getHours()).padStart(2, "0");
      const mins = String(d.getMinutes()).padStart(2, "0");
      return `${hours}:${mins}`;
    } catch {
      return "";
    }
  };

  const sqlCode = `-- Supabase da Guruh chatlari jadvali (SQL Editor ga nusxalab Run qiling):
CREATE TABLE IF NOT EXISTS public.group_messages (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    sender_role TEXT DEFAULT 'teacher',
    sender_avatar TEXT,
    content TEXT NOT NULL,
    is_announcement BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    reactions JSONB DEFAULT '{}'::jsonb,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Realtime funksiyasini yoqish:
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;
`;

  return (
    <div className="flex flex-col h-[650px] sm:h-[720px] rounded-2xl bg-slate-950/20 dark:bg-slate-950/40 border border-slate-200/50 dark:border-white/10 overflow-hidden relative backdrop-blur-xl">
      {/* 1. CHAT HEADER */}
      <div className="px-4 py-3 bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-slate-200/60 dark:border-white/10 flex items-center justify-between gap-3 shrink-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-md shrink-0"
            style={{ backgroundColor: group.color || "#3b82f6" }}
          >
            <MessageSquare size={20} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                {group.name} — Guruh Chati
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Realtime
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 truncate mt-0.5">
              <Users size={12} className="text-slate-400" />
              <span>{students.length} nafar o'quvchi va Ustoz</span>
            </p>
          </div>
        </div>

        {/* Right Search & SQL Info */}
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block w-44 lg:w-56">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Xabarlardan qidirish..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/60 dark:bg-white/10 border border-slate-200/80 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={() => fetchMessages()}
            title="Yangilash"
            className="p-2 rounded-xl bg-white/60 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-slate-200/60 dark:border-white/15 text-slate-600 dark:text-slate-300 transition-all"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            type="button"
            onClick={() => setShowSqlModal(true)}
            title="Supabase SQL Strukturasi"
            className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-600 dark:text-blue-400 transition-all flex items-center gap-1 text-xs font-semibold"
          >
            <Database size={14} />
            <span className="hidden md:inline">SQL Jadval</span>
          </button>
        </div>
      </div>

      {/* PINNED ANNOUNCEMENT BANNER (if any) */}
      {pinnedMessages.length > 0 && (
        <div className="px-4 py-2 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border-b border-amber-500/20 backdrop-blur-xl flex items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Pin size={14} className="text-amber-500 shrink-0 fill-amber-500" />
            <span className="font-bold text-amber-700 dark:text-amber-300 shrink-0">
              Qadalgan e'lon:
            </span>
            <p className="text-slate-700 dark:text-slate-200 truncate font-medium">
              {pinnedMessages[pinnedMessages.length - 1].content}
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              handleTogglePin(pinnedMessages[pinnedMessages.length - 1])
            }
            className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline shrink-0"
          >
            Bekor qilish
          </button>
        </div>
      )}

      {/* 2. MESSAGES STREAM AREA */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {loading && messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
            <RefreshCw size={24} className="animate-spin text-blue-500" />
            <span className="text-xs">Chat xabarlari yuklanmoqda...</span>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-14 h-14 rounded-3xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3 border border-blue-500/20 shadow-inner">
              <MessageSquare size={26} />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              Hozircha xabarlar yo'q
            </h4>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Guruh a'zolariga birinchi xabarni yoki e'lonni yozing!
            </p>
          </div>
        ) : (
          filteredMessages.map((msg, index) => {
            const isMe =
              String(msg.sender_id) === String(teacher.id) ||
              msg.sender_role === "teacher";
            const isAnnounce = msg.is_announcement;
            const reactions = msg.reactions || {};
            const hasReactions = Object.keys(reactions).length > 0;

            return (
              <div
                key={msg.id || index}
                className={`flex gap-3 group relative ${
                  isMe ? "justify-end" : "justify-start"
                }`}
              >
                {/* Other user's avatar */}
                {!isMe && (
                  <div className="shrink-0 self-end mb-1">
                    <Avatar
                      name={msg.sender_name}
                      photo={msg.sender_avatar}
                      size={34}
                      color={group.color}
                    />
                  </div>
                )}

                {/* Message Bubble Container */}
                <div
                  className={`flex flex-col max-w-[85%] sm:max-w-[75%] lg:max-w-[65%] ${
                    isMe ? "items-end" : "items-start"
                  }`}
                >
                  {/* Sender Name & Role */}
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-400">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {isMe ? "Siz (Ustoz)" : msg.sender_name}
                    </span>
                    {msg.sender_role === "teacher" && (
                      <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 text-[9px] font-extrabold border border-indigo-500/30">
                        Ustoz
                      </span>
                    )}
                    {msg.is_pinned && (
                      <span className="flex items-center gap-0.5 text-amber-500 text-[10px] font-bold">
                        <Pin size={10} className="fill-amber-500" /> Qadalgan
                      </span>
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`relative p-3 sm:p-3.5 rounded-3xl backdrop-blur-xl transition-all shadow-sm ${
                      isAnnounce
                        ? "bg-gradient-to-br from-amber-500/20 to-yellow-600/25 border border-amber-400/40 text-slate-900 dark:text-amber-100 shadow-[0_4px_20px_rgba(245,158,11,0.15)]"
                        : isMe
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs shadow-[0_4px_20px_rgba(59,130,246,0.2)]"
                        : "bg-white/80 dark:bg-white/10 text-slate-900 dark:text-white border border-slate-200/60 dark:border-white/10 rounded-bl-xs shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
                    }`}
                  >
                    {isAnnounce && (
                      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-300 text-xs font-black mb-1.5 pb-1 border-b border-amber-500/30 uppercase tracking-wider">
                        <Megaphone size={13} />
                        <span>Muhim E'lon</span>
                      </div>
                    )}

                    {/* Text */}
                    <p className="text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed">
                      {msg.content}
                    </p>

                    {/* Time & Read Status */}
                    <div
                      className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                        isMe && !isAnnounce ? "text-blue-200" : "text-slate-400"
                      }`}
                    >
                      <Clock size={10} />
                      <span>{formatMsgTime(msg.created_at)}</span>
                      {isMe && <CheckCheck size={12} className="text-blue-200" />}
                    </div>

                    {/* Hover Actions Menu (Pin, Emoji, Copy, Delete) */}
                    <div
                      className={`absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-900/90 dark:bg-slate-800/90 text-white px-2 py-1 rounded-xl shadow-lg backdrop-blur-md z-20 ${
                        isMe ? "-left-28" : "-right-28"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedEmojiFor(
                            selectedEmojiFor === msg.id ? null : msg.id
                          )
                        }
                        title="Reaksiya bildirish"
                        className="p-1 hover:text-amber-400 transition-colors"
                      >
                        <Smile size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTogglePin(msg)}
                        title={msg.is_pinned ? "Qadashni bekor qilish" : "Qadash"}
                        className={`p-1 transition-colors ${
                          msg.is_pinned ? "text-amber-400" : "hover:text-blue-400"
                        }`}
                      >
                        <Pin size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(msg)}
                        title="Nusxalash"
                        className="p-1 hover:text-emerald-400 transition-colors"
                      >
                        {copiedMsgId === msg.id ? (
                          <Check size={13} className="text-emerald-400" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                      {isMe && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg.id)}
                          title="O'chirish"
                          className="p-1 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Reaction Picker Popup */}
                  {selectedEmojiFor === msg.id && (
                    <div className="mt-1.5 p-1.5 rounded-2xl bg-slate-900/95 border border-white/20 shadow-2xl flex items-center gap-1.5 z-30 animate-in fade-in zoom-in-95">
                      {QUICK_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleToggleReaction(msg, emoji)}
                          className="w-7 h-7 rounded-xl hover:bg-white/20 flex items-center justify-center text-sm transition-transform hover:scale-125"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Reaction Badges Display */}
                  {hasReactions && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(reactions).map(([emoji, userIds]) => {
                        if (!userIds || userIds.length === 0) return null;
                        const hasReacted = userIds.includes(
                          String(teacher.id || "teacher")
                        );
                        return (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleToggleReaction(msg, emoji)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                              hasReacted
                                ? "bg-blue-500/20 text-blue-500 dark:text-blue-300 border border-blue-500/40"
                                : "bg-white/60 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10"
                            }`}
                          >
                            <span>{emoji}</span>
                            <span className="text-[10px]">{userIds.length}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* My Avatar */}
                {isMe && (
                  <div className="shrink-0 self-end mb-1">
                    <Avatar
                      name={teacher.name}
                      photo={teacher.avatar || teacher.photo}
                      size={34}
                      color="#3b82f6"
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. INPUT / COMPOSER BAR */}
      <div className="p-3 sm:p-4 bg-white/80 dark:bg-slate-900/90 backdrop-blur-2xl border-t border-slate-200/60 dark:border-white/10 shrink-0">
        {/* Quick Emoji Bar & Announcement Switch */}
        <div className="flex items-center justify-between gap-2 mb-2 px-1">
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setInputText((prev) => prev + emoji)}
                className="px-2 py-0.5 rounded-lg bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/15 border border-slate-200/60 dark:border-white/10 text-xs transition-transform active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Announcement toggle */}
          <button
            type="button"
            onClick={() => setIsAnnouncement(!isAnnouncement)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              isAnnouncement
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30"
                : "bg-white/60 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-amber-500 border border-slate-200/60 dark:border-white/10"
            }`}
          >
            <Megaphone size={13} />
            <span>E'lon qilish</span>
          </button>
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSendMessage}
          className="flex items-end gap-2 bg-white/90 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/15 p-2 focus-within:border-blue-500 dark:focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-inner"
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              isAnnouncement
                ? "Barcha o'quvchilarga muhim e'lon matnini yozing..."
                : `"${group.name}" guruhiga xabar yozing (Enter - yuborish)...`
            }
            className="flex-1 max-h-32 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 resize-none focus:outline-none p-1.5 leading-relaxed"
          />

          <div className="flex items-center gap-1 shrink-0 pb-1">
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                inputText.trim() && !sending
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 hover:scale-105 active:scale-95 cursor-pointer"
                  : "bg-slate-200 dark:bg-white/10 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Send size={16} className={sending ? "animate-pulse" : ""} />
            </button>
          </div>
        </form>
      </div>

      {/* 4. SUPABASE SQL MODAL */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-white/15 p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                  <Database size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base">Supabase Chat Jadvali</h3>
                  <p className="text-xs text-slate-400">
                    Haqiqiy Supabase bazasida chat xabarlarini saqlash
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Agar Supabase loyihangizda <code>group_messages</code> jadvali hali
              yaratilmagan bo'lsa, quyidagi SQL so'rovni Supabase SQL Editor
              bo'limida ishga tushiring:
            </p>

            <div className="relative rounded-2xl bg-black/50 border border-white/10 p-4 font-mono text-xs overflow-x-auto text-emerald-400">
              <pre>{sqlCode}</pre>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(sqlCode);
                  setCopiedSql(true);
                  setTimeout(() => setCopiedSql(false), 2000);
                }}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-sans text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                {copiedSql ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedSql ? "Nusxalandi!" : "Nusxalash"}</span>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
