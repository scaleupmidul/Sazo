import React, { useState, useMemo } from 'react';
import { ContactMessage } from '../../types';
import { Search, X, Trash2, Mail, CheckCircle } from 'lucide-react';
// FIX: Corrected the import path for `useAppStore` from the non-existent 'StoreContext.tsx' to the correct location 'store/index.ts'.
import { useAppStore } from '../../store';


interface MessageDetailsModalProps {
  message: ContactMessage;
  onClose: () => void;
  markMessageAsRead: (messageId: string, isRead: boolean) => Promise<void>;
  deleteContactMessage: (messageId: string) => Promise<void>;
}

const MessageDetailsModal: React.FC<MessageDetailsModalProps> = ({ message, onClose, markMessageAsRead, deleteContactMessage }) => {

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to permanently delete this message?')) {
            await deleteContactMessage(message.id);
            onClose();
        }
    }
    
    const handleToggleRead = async () => {
        await markMessageAsRead(message.id, !message.isRead);
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-black">Message from: {message.name}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X className="w-5 h-5"/></button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto text-black flex-1">
                    <p><span className="font-semibold">Email:</span> {message.email}</p>
                    <p><span className="font-semibold">Date:</span> {message.date}</p>
                    <div className="pt-4 border-t">
                        <p className="font-semibold mb-2">Message:</p>
                        <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 border-t flex justify-between items-center flex-wrap gap-2">
                    <div className="flex gap-2">
                        <button 
                            onClick={handleToggleRead} 
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center space-x-2">
                            {message.isRead ? <Mail className="w-4 h-4"/> : <CheckCircle className="w-4 h-4"/>}
                            <span>Mark as {message.isRead ? 'Unread' : 'Read'}</span>
                        </button>
                        <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center space-x-2">
                            <Trash2 className="w-4 h-4"/>
                            <span>Delete</span>
                        </button>
                    </div>
                    <button onClick={onClose} className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400 transition">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminMessagesPage: React.FC = () => {
  const { contactMessages, markMessageAsRead, deleteContactMessage } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const filteredMessages = useMemo(() => {
    return [...contactMessages].filter(msg => 
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contactMessages, searchTerm]);

  return (
    <div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold text-gray-800">Messages</h1>
            <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input 
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 pl-10 border rounded-lg text-sm bg-white text-black"
                />
            </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 w-8"></th>
                        <th scope="col" className="px-6 py-3">From</th>
                        <th scope="col" className="px-6 py-3">Message Snippet</th>
                        <th scope="col" className="px-6 py-3">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredMessages.map(msg => (
                        <tr key={msg.id} className={`border-b hover:bg-gray-50 cursor-pointer ${!msg.isRead ? 'bg-pink-50 font-semibold' : 'bg-white'}`} onClick={() => setSelectedMessage(msg)}>
                            <td className="px-6 py-4">
                                {!msg.isRead && <span className="inline-block w-2.5 h-2.5 bg-pink-500 rounded-full"></span>}
                            </td>
                            <td className="px-6 py-4 text-gray-900">
                                <div>{msg.name}</div>
                                <div className={`text-xs ${!msg.isRead ? 'text-pink-600' : 'text-gray-500'}`}>{msg.email}</div>
                            </td>
                            <td className="px-6 py-4 max-w-sm truncate">{msg.message}</td>
                            <td className="px-6 py-4">{msg.date}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        {selectedMessage && <MessageDetailsModal 
            message={selectedMessage} 
            onClose={() => setSelectedMessage(null)}
            markMessageAsRead={markMessageAsRead}
            deleteContactMessage={deleteContactMessage}
        />}
    </div>
  );
};

export default AdminMessagesPage;