import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = 'http://localhost:3001/quotes';

const fetchQuotes = async (category) => {
  const url = category ? `${API_URL}?category=${category}` : API_URL;
  const { data } = await axios.get(url);
  return data;
};

const createQuote = async (newQuote) => {
  const { data } = await axios.post(API_URL, newQuote);
  return data;
};

const deleteQuote = async (id) => {
  const { data } = await axios.delete(`${API_URL}/${id}`);
  return data;
};

const CATEGORIES = ['Фантастика', 'Драма', 'Комедия'];

function App() {
  const queryClient = useQueryClient();
  const [filterCategory, setFilterCategory] = useState('');
  const [formData, setFormData] = useState({ text: '', author: '', category: 'sci-fi' });

  const { data: quotes, isLoading, isError, error } = useQuery({
    queryKey: ['quotes', filterCategory],
    queryFn: () => fetchQuotes(filterCategory),
  });

  const addMutation = useMutation({
    mutationFn: createQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      setFormData({ text: '', author: '', category: 'sci-fi' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.text || !formData.author) return;
    addMutation.mutate(formData);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <h1>Менеджер цитат</h1>

      <section style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>Добавить новую цитату</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="text"
            name="text"
            placeholder="Текст цитаты"
            value={formData.text}
            onChange={handleInputChange}
            style={{ padding: '8px', fontSize: '14px' }}
            required
          />
          <input
            type="text"
            name="author"
            placeholder="Автор"
            value={formData.author}
            onChange={handleInputChange}
            style={{ padding: '8px', fontSize: '14px' }}
            required
          />
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            style={{ padding: '8px', fontSize: '14px' }}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={addMutation.isPending}
            style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {addMutation.isPending ? 'Добавление...' : 'Добавить цитату'}
          </button>
          {addMutation.isError && <p style={{ color: 'red' }}>Ошибка при добавлении цитаты.</p>}
        </form>
      </section>

      <section style={{ marginBottom: '20px' }}>
        <label htmlFor="filter" style={{ marginRight: '10px', fontWeight: 'bold' }}>Фильтр по категориям:</label>
        <select
          id="filter"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ padding: '6px', fontSize: '14px' }}
        >
          <option value="">Все категории</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </section>

      <section>
        <h2>Список цитат</h2>
        
        {isLoading && <p>Загрузка списка...</p>}
        {isError && <p style={{ color: 'red' }}>Ошибка получения данных: {error.message}</p>}

        {quotes && quotes.length === 0 && <p>Цитаты не найдены.</p>}

        {quotes && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {quotes.map((quote) => (
              <div
                key={quote.id}
                style={{
                  padding: '15px',
                  border: '1px solid #eee',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <blockquote style={{ margin: '0 0 8px 0', fontSize: '16px', fontStyle: 'italic' }}>
                    "{quote.text}"
                  </blockquote>
                  <cite style={{ fontSize: '14px', color: '#666' }}>
                    — {quote.author} <span style={{ color: '#007bff' }}>({quote.category})</span>
                  </cite>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(quote.id)}
                  disabled={deleteMutation.isPending}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default App;