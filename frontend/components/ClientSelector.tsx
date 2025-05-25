import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/lib/auth-provider';
import { Search, User, Loader2 } from 'lucide-react';
import { Client } from '@/types/client';

interface ClientSelectorProps {
  onClientSelect: (client: Client) => void;
  selectedClientId?: string;
  className?: string;
}

export default function ClientSelector({ onClientSelect, selectedClientId, className = '' }: ClientSelectorProps) {
  const { token } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients();
  }, [token]);

  // Fetch selected client when selectedClientId changes
  useEffect(() => {
    if (selectedClientId && clients.length > 0) {
      const client = clients.find(c => c._id === selectedClientId);
      if (client) {
        setSelectedClient(client);
      }
    }
  }, [selectedClientId, clients]);

  // Filter clients when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(client => 
        client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm)
      );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);

  const fetchClients = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch all clients (we'll use a larger limit to get most clients)
      const response = await axios.get('http://localhost:5000/api/clients?per_page=100', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setClients(response.data.clients);
      setFilteredClients(response.data.clients);
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      setError('Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    onClientSelect(client);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`}>
      <label htmlFor="client-selector" className="block text-sm font-medium text-gray-700 mb-1">
        Client
      </label>
      
      {/* Selected client display or search input */}
      <div 
        className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedClient ? (
          <div className="flex items-center">
            <User size={18} className="text-gray-500 mr-2" />
            <div>
              <div className="font-medium">{selectedClient.full_name}</div>
              <div className="text-sm text-gray-500">{selectedClient.email}</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center w-full">
            <Search size={18} className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search clients..."
              className="w-full outline-none"
              value={searchTerm}
              onChange={(e) => {
                e.stopPropagation();
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
        
        {selectedClient && (
          <button 
            className="text-gray-400 hover:text-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedClient(null);
              setIsOpen(true);
            }}
          >
            ✕
          </button>
        )}
      </div>
      
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 size={20} className="animate-spin text-blue-500 mr-2" />
              <span>Loading clients...</span>
            </div>
          ) : error ? (
            <div className="p-4 text-red-500">{error}</div>
          ) : filteredClients.length === 0 ? (
            <div className="p-4 text-gray-500">No clients found</div>
          ) : (
            <ul>
              {filteredClients.map((client) => (
                <li 
                  key={client._id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleClientSelect(client)}
                >
                  <div className="font-medium">{client.full_name}</div>
                  <div className="text-sm text-gray-500 flex justify-between">
                    <span>{client.email}</span>
                    <span>{client.phone}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
