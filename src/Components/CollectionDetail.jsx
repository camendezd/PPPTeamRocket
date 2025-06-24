import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import styles from './CollectionDetail.module.css';
import Loading from '../pages/Loading';

const CollectionDetail = () => {
  const { auth } = useAuth();
  const { collectionId } = useParams();
  const navigate = useNavigate();

  const [collection, setCollection] = useState(null);
  const [cardImages, setCardImages] = useState([]);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [loading, setLoading] = useState(true);

  const getCardImage = async (cardId) => {
    try {
      const res = await axios.get(`https://api.pokemontcg.io/v2/cards/${cardId}`, {
        headers: { 'X-Api-Key': process.env.REACT_APP_POKEMON_API_KEY }
      });
      return { image: res.data.data.images.small, id: cardId };
    } catch {
      return { image: 'https://via.placeholder.com/150', id: cardId };
    }
  };

  const fetchCollection = async () => {
    try {
      const userId = auth?.user?._id;
      if (!userId || !collectionId) return;

      const res = await fetch(`http://localhost:5000/api/cards/collections/detail-by-id/${userId}/${collectionId}`);
      const data = await res.json();

      if (res.ok && data.collection) {
        setCollection(data.collection);
        setNewName(data.collection.name);
        setNewDescription(data.collection.description || '');

        const images = await Promise.all(
          (data.collection.cards || []).map(async (c) => await getCardImage(c.cardId))
        );
        setCardImages(images);
      } else {
        toast.error(data.message || 'Collection not found.');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error loading collection.');
    } finally {
      setTimeout(() => setLoading(false), 1200);
    }
  };

  useEffect(() => {
    if (auth?.user?._id && collectionId) {
      fetchCollection();
    }
  }, [auth?.user?._id, collectionId]);

  const handleUpdateName = async () => {
    try {
      const userId = auth?.user?._id;
      if (!userId || !collection?.name) return;

      const res = await fetch(`http://localhost:5000/api/cards/collections/edit/${userId}/${collection.name}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName, newDescription })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Collection updated!');
        setEditingName(false);
        fetchCollection();
      } else {
        toast.error(data.message || 'Error updating collection');
      }
    } catch (err) {
      toast.error('Server error updating collection.');
    }
  };

  const handleDeleteCollection = async () => {
    if (!window.confirm('Are you sure you want to delete this collection?')) return;

    try {
      const userId = auth?.user?._id;
      if (!userId || !collectionId) return;

      const res = await fetch(`http://localhost:5000/api/cards/collections/${userId}/${collectionId}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Collection deleted.');
        navigate('/collections/my');
      } else {
        toast.error(data.message || 'Failed to delete collection.');
      }
    } catch {
      toast.error('Server error deleting collection.');
    }
  };

  if (loading) return <Loading />;
  if (!collection) return <p className={styles.error}>Collection not found.</p>;

  return (
    <div className={styles.container}>
      {editingName ? (
        <div className={styles.editGroup}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className={styles.input}
          />
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className={styles.textarea}
          />
          <button onClick={handleUpdateName} className={styles.button}>Save</button>
          <button onClick={() => setEditingName(false)} className={styles.cancel}>Cancel</button>
        </div>
      ) : (
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{collection.name}</h1>
          <button onClick={() => setEditingName(true)} className={styles.editBtn}>Edit</button>
        </div>
      )}

      <p className={styles.description}>{collection.description || 'No description provided.'}</p>

      <button onClick={handleDeleteCollection} className={styles.deleteButton}>Delete Collection</button>

      <div className={styles.grid}>
        {cardImages.map(({ image, id }, i) => (
          <img
            key={i}
            src={image}
            alt={`Card ${i}`}
            className={styles.cardImage}
            onClick={() => navigate(`/cards/${id}`)}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </div>
    </div>
  );
};

export default CollectionDetail;
