import React, { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_BASE_URL;

export function App() {
  const [health, setHealth] = useState<string>('');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');

  // Planner state
  const [weekStart, setWeekStart] = useState(''); // YYYY-MM-DD
  const [plan, setPlan] = useState<any[]>([]);
  const [planStatus, setPlanStatus] = useState('');

  // Preferences state
  const [dietPreferences, setDietPreferences] = useState<string>(''); // comma-separated
  const [budgetCents, setBudgetCents] = useState<string>('');
  const [prefsStatus, setPrefsStatus] = useState('');

  // Recommendations state
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const [submitTitle, setSubmitTitle] = useState('');
  const [submitDescription, setSubmitDescription] = useState('');
  const [submitImages, setSubmitImages] = useState(''); // comma-separated URLs
  const [submitStatus, setSubmitStatus] = useState('');

  const [dataUrl, setDataUrl] = useState('');
  const [uploadPath, setUploadPath] = useState('');

  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratings, setRatings] = useState<any[]>([]);

  const [challenges, setChallenges] = useState<any[]>([]);
  const [pendingRecipes, setPendingRecipes] = useState<any[]>([]);
  const [newChallenge, setNewChallenge] = useState({ title: '', description: '', start: '', end: '' });

  const [premiumUserId, setPremiumUserId] = useState('');
  const [premiumUntil, setPremiumUntil] = useState('');
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorUrl, setSponsorUrl] = useState('');
  const [compareName, setCompareName] = useState('');
  const [compareUnit, setCompareUnit] = useState('g');
  const [compareResult, setCompareResult] = useState('');
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [adPlacement, setAdPlacement] = useState('home_top');
  const [adImageUrl, setAdImageUrl] = useState('');
  const [adTargetUrl, setAdTargetUrl] = useState('');
  const [storeId, setStoreId] = useState('1');
  const [affiliateTemplate, setAffiliateTemplate] = useState('https://example.com/search?q={query}&aff=YOURID');

  useEffect(() => {
    fetch(`${API}/api/health`).then(r => r.json()).then(d => setHealth(JSON.stringify(d))).catch(() => setHealth('error'));
  }, []);

  async function loadRecipes() {
    const res = await fetch(`${API}/api/recipes`);
    const data = await res.json();
    setRecipes(data.recipes ?? []);
  }

  async function doAuth(path: 'login' | 'register') {
    const res = await fetch(`${API}/api/auth/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok && data.token) setToken(data.token);
  }

  async function loadWeekPlan() {
    if (!token || !weekStart) return;
    setPlanStatus('Loading...');
    const res = await fetch(`${API}/api/planner/week?weekStart=${encodeURIComponent(weekStart)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      setPlan(data.items ?? []);
      setPlanStatus('Loaded');
    } else {
      setPlanStatus(data.error || 'Error');
    }
  }

  async function saveWeekPlan() {
    if (!token || !weekStart) return;
    setPlanStatus('Saving...');
    const res = await fetch(`${API}/api/planner/week`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ weekStart, items: plan.map(p => ({ date: p.planned_date, mealSlot: p.meal_slot, recipeId: p.recipe_id, servings: p.servings })) })
    });
    if (res.status === 204) {
      setPlanStatus('Saved');
    } else {
      const data = await res.json().catch(() => ({}));
      setPlanStatus(data.error || 'Error');
    }
  }

  async function loadPreferences() {
    if (!token) return;
    setPrefsStatus('Loading...');
    const res = await fetch(`${API}/api/preferences`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) {
      setDietPreferences((data.dietPreferences || []).join(','));
      setBudgetCents(String(data.budgetCents ?? ''));
      setPrefsStatus('Loaded');
    } else {
      setPrefsStatus(data.error || 'Error');
    }
  }

  async function savePreferences() {
    if (!token) return;
    setPrefsStatus('Saving...');
    const res = await fetch(`${API}/api/preferences`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        dietPreferences: dietPreferences.split(',').map(s => s.trim()).filter(Boolean),
        budgetCents: budgetCents ? Number(budgetCents) : null
      })
    });
    if (res.status === 204) setPrefsStatus('Saved');
    else {
      const data = await res.json().catch(() => ({}));
      setPrefsStatus(data.error || 'Error');
    }
  }

  async function loadRecommendations() {
    if (!token) return;
    const res = await fetch(`${API}/api/recommendations`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setRecommendations(data.recipes || []);
  }

  function addPlanRow() {
    setPlan(prev => prev.concat({ planned_date: weekStart, meal_slot: 'dinner', recipe_id: recipes[0]?.id || '', servings: 2 }));
  }

  return (
    <div style={{ fontFamily: 'system-ui', padding: 16, maxWidth: 900 }}>
      <h1>Admin Dashboard</h1>
      <p>API: {API}</p>
      <p>Health: {health}</p>

      <section style={{ marginTop: 24 }}>
        <h2>Auth</h2>
        <input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={() => doAuth('register')}>Register</button>
        <button onClick={() => doAuth('login')}>Login</button>
        <div>Token: {token ? token.slice(0, 16) + '...' : '—'}</div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Recipes</h2>
        <button onClick={loadRecipes}>Load</button>
        <ul>
          {recipes.map(r => (
            <li key={r.id}>{r.title}</li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Weekly Planner</h2>
        <div>
          <input type="date" placeholder="Week start (YYYY-MM-DD)" value={weekStart} onChange={e => setWeekStart(e.target.value)} />
          <button onClick={loadWeekPlan} disabled={!token || !weekStart}>Load plan</button>
          <button onClick={saveWeekPlan} disabled={!token || !weekStart}>Save plan</button>
          <span style={{ marginLeft: 8 }}>{planStatus}</span>
        </div>
        <div style={{ marginTop: 8 }}>
          <button onClick={addPlanRow} disabled={!weekStart || recipes.length === 0}>Add row</button>
        </div>
        <table style={{ width: '100%', marginTop: 8, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Date</th>
              <th style={{ textAlign: 'left' }}>Meal</th>
              <th style={{ textAlign: 'left' }}>Recipe</th>
              <th style={{ textAlign: 'left' }}>Servings</th>
            </tr>
          </thead>
          <tbody>
            {plan.map((row, idx) => (
              <tr key={idx}>
                <td>
                  <input type="date" value={row.planned_date} onChange={e => setPlan(p => p.map((r, i) => i === idx ? { ...r, planned_date: e.target.value } : r))} />
                </td>
                <td>
                  <select value={row.meal_slot} onChange={e => setPlan(p => p.map((r, i) => i === idx ? { ...r, meal_slot: e.target.value } : r))}>
                    <option value="breakfast">breakfast</option>
                    <option value="lunch">lunch</option>
                    <option value="dinner">dinner</option>
                    <option value="snack">snack</option>
                  </select>
                </td>
                <td>
                  <select value={row.recipe_id} onChange={e => setPlan(p => p.map((r, i) => i === idx ? { ...r, recipe_id: e.target.value } : r))}>
                    <option value="">— choose —</option>
                    {recipes.map(r => (
                      <option key={r.id} value={r.id}>{r.title}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input type="number" min={1} value={row.servings ?? 2} onChange={e => setPlan(p => p.map((r, i) => i === idx ? { ...r, servings: Number(e.target.value || 2) } : r))} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 8 }}>
          <button onClick={async () => {
            if (!token || !weekStart) return;
            const res = await fetch(`${API}/api/planner/week/grocery-list?weekStart=${encodeURIComponent(weekStart)}&includeCost=true`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            alert(JSON.stringify(data));
          }}>Generate Grocery List</button>
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Preferences</h2>
        <div>
          <button onClick={loadPreferences} disabled={!token}>Load</button>
        </div>
        <div style={{ marginTop: 8 }}>
          <label>Diet (comma separated): </label>
          <input style={{ width: 400 }} placeholder="vegan,keto,budget" value={dietPreferences} onChange={e => setDietPreferences(e.target.value)} />
        </div>
        <div style={{ marginTop: 8 }}>
          <label>Budget cents: </label>
          <input type="number" placeholder="2000" value={budgetCents} onChange={e => setBudgetCents(e.target.value)} />
        </div>
        <div style={{ marginTop: 8 }}>
          <button onClick={savePreferences} disabled={!token}>Save</button>
          <span style={{ marginLeft: 8 }}>{prefsStatus}</span>
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Recommendations</h2>
        <button onClick={loadRecommendations} disabled={!token}>Load</button>
        <ul>
          {recommendations.map(r => (
            <li key={r.id}>{r.title}</li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Submit Recipe</h2>
        <div>
          <input style={{ width: 400 }} placeholder="Title" value={submitTitle} onChange={e => setSubmitTitle(e.target.value)} />
        </div>
        <div style={{ marginTop: 8 }}>
          <textarea style={{ width: 400, height: 80 }} placeholder="Description" value={submitDescription} onChange={e => setSubmitDescription(e.target.value)} />
        </div>
        <div style={{ marginTop: 8 }}>
          <input style={{ width: 400 }} placeholder="Image URLs (comma separated)" value={submitImages} onChange={e => setSubmitImages(e.target.value)} />
        </div>
        <div style={{ marginTop: 8 }}>
          <button disabled={!token || !submitTitle} onClick={async () => {
            setSubmitStatus('Submitting...');
            const body = {
              title: submitTitle,
              description: submitDescription,
              images: submitImages.split(',').map(s => s.trim()).filter(Boolean)
            };
            const res = await fetch(`${API}/api/recipes/submit`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify(body)
            });
            const data = await res.json().catch(() => ({}));
            setSubmitStatus(res.ok ? `Submitted (id=${data.id}, share=${data.shareToken})` : (data.error || 'Error'));
          }}>Submit</button>
          <span style={{ marginLeft: 8 }}>{submitStatus}</span>
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Upload Image (base64)</h2>
        <div>
          <textarea style={{ width: 500, height: 120 }} placeholder="Paste data URL (data:image/png;base64,...)" value={dataUrl} onChange={e => setDataUrl(e.target.value)} />
        </div>
        <div style={{ marginTop: 8 }}>
          <button disabled={!token || !dataUrl} onClick={async () => {
            const res = await fetch(`${API}/api/uploads/image-base64`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ dataUrl })
            });
            const data = await res.json().catch(() => ({}));
            setUploadPath(res.ok ? data.path : (data.error || 'Error'));
          }}>Upload</button>
          <span style={{ marginLeft: 8 }}>Saved: {uploadPath || '—'}</span>
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Ratings</h2>
        <div>
          <select value={selectedRecipeId} onChange={e => setSelectedRecipeId(e.target.value)}>
            <option value="">— choose recipe —</option>
            {recipes.map(r => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
          <button disabled={!selectedRecipeId} onClick={async () => {
            const res = await fetch(`${API}/api/recipes/${selectedRecipeId}/ratings`);
            const data = await res.json();
            setRatings(data.ratings || []);
          }}>Load Ratings</button>
        </div>
        <div style={{ marginTop: 8 }}>
          <label>Rating: </label>
          <input type="number" min={1} max={5} value={ratingValue} onChange={e => setRatingValue(Number(e.target.value))} />
          <input style={{ width: 400, marginLeft: 8 }} placeholder="Comment" value={ratingComment} onChange={e => setRatingComment(e.target.value)} />
          <button disabled={!token || !selectedRecipeId} onClick={async () => {
            const res = await fetch(`${API}/api/recipes/${selectedRecipeId}/ratings`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ rating: ratingValue, comment: ratingComment })
            });
            if (res.status === 204) {
              const res2 = await fetch(`${API}/api/recipes/${selectedRecipeId}/ratings`);
              const data2 = await res2.json();
              setRatings(data2.ratings || []);
            }
          }}>Submit</button>
        </div>
        <ul>
          {ratings.map((r, i) => (
            <li key={i}>⭐ {r.rating} — {r.comment || ''}</li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Challenges</h2>
        <button onClick={async () => {
          const res = await fetch(`${API}/api/challenges`);
          const data = await res.json();
          setChallenges(data.challenges || []);
        }}>Load</button>
        <ul>
          {challenges.map((c: any) => (
            <li key={c.id}>{c.title} ({c.start_date} → {c.end_date})</li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Comments</h2>
        <div>
          <select value={selectedRecipeId} onChange={e => setSelectedRecipeId(e.target.value)}>
            <option value="">— choose recipe —</option>
            {recipes.map(r => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
          <button disabled={!selectedRecipeId} onClick={async () => {
            const res = await fetch(`${API}/api/recipes/${selectedRecipeId}/comments`);
            const data = await res.json();
            setRatings([]);
            setChallenges([]);
            setPlan([]);
            setPrefsStatus('');
            setRecommendations([]);
            setHealth('');
            setUploadPath('');
            setSubmitStatus('');
            setDietPreferences(dietPreferences);
            setBudgetCents(budgetCents);
            setEmail(email);
            setPassword(password);
            setRecipes(recipes);
            setPlanStatus('');
            // reuse ratings state to show comments list quickly
            setRatings((data.comments || []).map((c: any) => ({ rating: '', comment: c.content })));
          }}>Load Comments</button>
        </div>
        <div style={{ marginTop: 8 }}>
          <input style={{ width: 400 }} placeholder="Add comment" value={ratingComment} onChange={e => setRatingComment(e.target.value)} />
          <button disabled={!token || !selectedRecipeId || !ratingComment} onClick={async () => {
            const res = await fetch(`${API}/api/recipes/${selectedRecipeId}/comments`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ content: ratingComment })
            });
            if (res.ok) {
              const res2 = await fetch(`${API}/api/recipes/${selectedRecipeId}/comments`);
              const data2 = await res2.json();
              setRatings((data2.comments || []).map((c: any) => ({ rating: '', comment: c.content })));
              setRatingComment('');
            }
          }}>Post</button>
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Admin: Approvals</h2>
        <div>
          <button disabled={!token} onClick={async () => {
            // naive: list all recipes and filter in UI for demo (no dedicated endpoint yet)
            const res = await fetch(`${API}/api/recipes`);
            const data = await res.json();
            setPendingRecipes((data.recipes || []).filter((r: any) => r.is_approved === false));
          }}>Load Pending</button>
        </div>
        <ul>
          {pendingRecipes.map((r: any) => (
            <li key={r.id}>
              {r.title}
              <button style={{ marginLeft: 8 }} disabled={!token} onClick={async () => {
                await fetch(`${API}/api/admin/recipes/${r.id}/approval`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ isApproved: true })
                });
              }}>Approve</button>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Admin: Challenges</h2>
        <div>
          <input placeholder="Title" value={newChallenge.title} onChange={e => setNewChallenge({ ...newChallenge, title: e.target.value })} />
          <input placeholder="Start (YYYY-MM-DD)" value={newChallenge.start} onChange={e => setNewChallenge({ ...newChallenge, start: e.target.value })} />
          <input placeholder="End (YYYY-MM-DD)" value={newChallenge.end} onChange={e => setNewChallenge({ ...newChallenge, end: e.target.value })} />
          <button disabled={!token || !newChallenge.title} onClick={async () => {
            await fetch(`${API}/api/admin/challenges`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ title: newChallenge.title, start_date: newChallenge.start, end_date: newChallenge.end, description: '' })
            });
          }}>Create</button>
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Admin: Monetization</h2>
        <div style={{ border: '1px solid #ccc', padding: 12, marginBottom: 12 }}>
          <h3>Set Premium for User</h3>
          <input style={{ width: 340 }} placeholder="User ID" value={premiumUserId} onChange={e => setPremiumUserId(e.target.value)} />
          <input style={{ width: 220, marginLeft: 8 }} type="datetime-local" placeholder="Expires at (optional)" value={premiumUntil} onChange={e => setPremiumUntil(e.target.value)} />
          <button disabled={!token || !premiumUserId} onClick={async () => {
            await fetch(`${API}/api/admin/users/${premiumUserId}/premium`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ isPremium: true, premiumExpiresAt: premiumUntil || null })
            });
          }}>Grant Premium</button>
          <button style={{ marginLeft: 8 }} disabled={!token || !premiumUserId} onClick={async () => {
            await fetch(`${API}/api/admin/users/${premiumUserId}/premium`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ isPremium: false, premiumExpiresAt: null })
            });
          }}>Revoke Premium</button>
        </div>

        <div style={{ border: '1px solid #ccc', padding: 12, marginBottom: 12 }}>
          <h3>Recipe Sponsorship</h3>
          <div>
            <select value={selectedRecipeId} onChange={e => setSelectedRecipeId(e.target.value)}>
              <option value="">— choose recipe —</option>
              {recipes.map(r => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
            <input style={{ marginLeft: 8 }} placeholder="Sponsor Name" value={sponsorName} onChange={e => setSponsorName(e.target.value)} />
            <input style={{ marginLeft: 8, width: 300 }} placeholder="Sponsor URL" value={sponsorUrl} onChange={e => setSponsorUrl(e.target.value)} />
            <label style={{ marginLeft: 8 }}>
              <input type="checkbox" checked={premiumOnly} onChange={e => setPremiumOnly(e.target.checked)} /> Premium-only
            </label>
            <button style={{ marginLeft: 8 }} disabled={!token || !selectedRecipeId} onClick={async () => {
              await fetch(`${API}/api/admin/recipes/${selectedRecipeId}/sponsorship`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ isSponsored: true, sponsorName, sponsorUrl, isPremiumOnly: premiumOnly })
              });
            }}>Save</button>
            <button style={{ marginLeft: 8 }} disabled={!token || !selectedRecipeId} onClick={async () => {
              await fetch(`${API}/api/admin/recipes/${selectedRecipeId}/sponsorship`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ isSponsored: false, sponsorName: null, sponsorUrl: null, isPremiumOnly: false })
              });
            }}>Clear</button>
          </div>
        </div>

        <div style={{ border: '1px solid #ccc', padding: 12, marginBottom: 12 }}>
          <h3>Ads</h3>
          <div>
            <input placeholder="Placement" value={adPlacement} onChange={e => setAdPlacement(e.target.value)} />
            <input placeholder="Image URL" value={adImageUrl} onChange={e => setAdImageUrl(e.target.value)} style={{ marginLeft: 8, width: 300 }} />
            <input placeholder="Target URL" value={adTargetUrl} onChange={e => setAdTargetUrl(e.target.value)} style={{ marginLeft: 8, width: 300 }} />
            <button style={{ marginLeft: 8 }} disabled={!token || !adPlacement || !adImageUrl || !adTargetUrl} onClick={async () => {
              await fetch(`${API}/api/ads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ placement: adPlacement, image_url: adImageUrl, target_url: adTargetUrl, is_active: true })
              });
            }}>Create Ad</button>
          </div>
        </div>

        <div style={{ border: '1px solid #ccc', padding: 12 }}>
          <h3>Affiliate Template</h3>
          <div>
            <input placeholder="Store ID" value={storeId} onChange={e => setStoreId(e.target.value)} />
            <input placeholder="Template (use {query})" value={affiliateTemplate} onChange={e => setAffiliateTemplate(e.target.value)} style={{ marginLeft: 8, width: 500 }} />
            <button style={{ marginLeft: 8 }} disabled={!token || !storeId} onClick={async () => {
              await fetch(`${API}/api/admin/stores/${encodeURIComponent(storeId)}/affiliate-template`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ template: affiliateTemplate })
              });
            }}>Save Template</button>
          </div>
        </div>

        <div style={{ border: '1px solid #ccc', padding: 12 }}>
          <h3>Price Comparison (Premium)</h3>
          <input placeholder="Ingredient name" value={compareName} onChange={e => setCompareName(e.target.value)} />
          <select value={compareUnit} onChange={e => setCompareUnit(e.target.value)} style={{ marginLeft: 8 }}>
            <option value="g">g</option>
            <option value="ml">ml</option>
            <option value="pcs">pcs</option>
          </select>
          <button style={{ marginLeft: 8 }} disabled={!token || !compareName} onClick={async () => {
            const res = await fetch(`${API}/api/prices/compare?name=${encodeURIComponent(compareName)}&unit=${encodeURIComponent(compareUnit)}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setCompareResult(JSON.stringify(data));
          }}>Compare</button>
          <div style={{ marginTop: 8 }}>
            <textarea style={{ width: 700, height: 140 }} value={compareResult} onChange={() => {}} />
          </div>
        </div>
      </section>
    </div>
  );
}