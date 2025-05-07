import React, { useEffect, useState, useRef } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import './App.css';

const headers = {
  'X-Rapidapi-Key': process.env.REACT_APP_RAPIDAPI_KEY,
  'X-Rapidapi-Host': 'the-cocktail-db3.p.rapidapi.com'
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<CocktailList />} />
      <Route path="/recipe/:id" element={<RecipePage />} />
    </Routes>
  );
}

function CocktailList() {
  const [cocktails, setCocktails] = useState([]);
  const [category, setCategory] = useState("all");
  const [favorites, setFavorites] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const itemsPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    fetch("https://the-cocktail-db3.p.rapidapi.com/", { headers })
      .then(res => res.json())
      .then(setCocktails);

    const saved = localStorage.getItem("favorites");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const toggleFavorite = (drink) => {
    const exists = favorites.find(f => f.id === drink.id);
    const updated = exists
      ? favorites.filter(f => f.id !== drink.id)
      : [...favorites, drink];
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const filtered = cocktails.filter(drink =>
    category === 'all' ? true : drink.title.toLowerCase().includes(category.toLowerCase())
  );
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="app">
      <audio ref={audioRef} loop>
        <source src="public/bar-music.mp3" type="audio/mpeg" />
      </audio>
      <div className="audio-control">
        <button onClick={() => {
          if (playing) audioRef.current.pause();
          else audioRef.current.play();
          setPlaying(!playing);
        }}>
          {playing ? '🔇 Mute Music' : '🔊 Play Music'}
        </button>
      </div>

      <h1>🍸 Bar Mix – Tj's Lounge</h1>

      <select value={category} onChange={e => setCategory(e.target.value)}>
        <option value="all">All</option>
        <option value="vodka">Vodka</option>
        <option value="rum">Rum</option>
        <option value="gin">Gin</option>
      </select>

      <div className="grid">
        {paginated.map(drink => (
          <div key={drink.id} className="card">
            <img
              src={drink.image}
              alt={drink.title}
              onClick={() => navigate(`/recipe/${drink.id}`)}
            />
            <h3>{drink.title}</h3>
            <button onClick={() => toggleFavorite(drink)}>
              {favorites.find(f => f.id === drink.id) ? '💔 Remove' : '💖 Favorite'}
            </button>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>← Prev</button>
        <span>Page {currentPage}</span>
        <button disabled={currentPage * itemsPerPage >= filtered.length} onClick={() => setCurrentPage(p => p + 1)}>Next →</button>
      </div>

      {favorites.length > 0 && (
        <div className="favorites">
          <h2>⭐ Favorites</h2>
          <div className="grid">
            {favorites.map(drink => (
              <div key={drink.id} className="card">
                <img
                  src={drink.image}
                  alt={drink.title}
                  onClick={() => navigate(`/recipe/${drink.id}`)}
                />
                <h3>{drink.title}</h3>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RecipePage() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`https://the-cocktail-db3.p.rapidapi.com/${id}`, { headers })
      .then(res => res.json())
      .then(setRecipe)
      .catch(console.error);
  }, [id]);

  if (!recipe) return <p className="app">Loading recipe...</p>;

  return (
    <div className="recipe-page">
      <button onClick={() => navigate("/")}>← Back to List</button>
      <h2>{recipe.title}</h2>
      <img src={recipe.image} alt={recipe.title} />
      <p><strong>Difficulty:</strong> {recipe.difficulty}</p>
      <p><strong>Portion:</strong> {recipe.portion}</p>
      <p><strong>Time:</strong> {recipe.time}</p>
      <p>{recipe.description}</p>
      <h4>Ingredients:</h4>
      <ul>
        {recipe.ingredients?.map((ing, i) => <li key={i}>{ing}</li>)}
      </ul>
      <h4>Method:</h4>
      <ol>
        {recipe.method?.map((step, i) => (
          <li key={i}>{Object.values(step)[0]}</li>
        ))}
      </ol>
    </div>
  );
}

export default App;
