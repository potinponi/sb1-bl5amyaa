import { db } from './firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import type { Chatbot, Flow, Lead, ChatInteraction, Feedback } from '../types';

/**
 * Chatbot operations
 */
export const chatbotOperations = {
  async create(chatbot: Chatbot) {
    const docRef = doc(db, 'chatbots', chatbot.user_id);
    await setDoc(docRef, chatbot);
    return chatbot;
  },

  async get(userId: string) {
    const docRef = doc(db, 'chatbots', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as Chatbot : null;
  }
};

/**
 * Flow operations
 */
export const flowOperations = {
  async create(flow: Flow) {
    const docRef = doc(collection(db, 'flows'));
    await setDoc(docRef, { ...flow, id: docRef.id });
    return { ...flow, id: docRef.id };
  },

  async getLatest(chatbotId: string) {
    const q = query(
      collection(db, 'flows'),
      where('chatbot_id', '==', chatbotId),
      orderBy('created_at', 'desc'),
      limit(1)
    );
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : snapshot.docs[0].data() as Flow;
  }
};

/**
 * Lead operations
 */
export const leadOperations = {
  async create(lead: Lead) {
    const docRef = doc(collection(db, 'leads'));
    await setDoc(docRef, { ...lead, id: docRef.id });
    return { ...lead, id: docRef.id };
  },

  async getAll(chatbotId: string) {
    const q = query(
      collection(db, 'leads'),
      where('chatbot_id', '==', chatbotId),
      orderBy('created_at', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Lead[];
  }
};

/**
 * Chat interaction operations
 */
export const interactionOperations = {
  async create(interaction: ChatInteraction) {
    const docRef = doc(collection(db, 'chat_interactions'));
    await setDoc(docRef, { ...interaction, id: docRef.id });
    return { ...interaction, id: docRef.id };
  },

  async getAll(chatbotId: string) {
    const q = query(
      collection(db, 'chat_interactions'),
      where('chatbot_id', '==', chatbotId),
      orderBy('created_at', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChatInteraction[];
  }
};

/**
 * Feedback operations
 */
export const feedbackOperations = {
  async create(feedback: Feedback) {
    const docRef = doc(collection(db, 'feedback'));
    await setDoc(docRef, { ...feedback, id: docRef.id });
    return { ...feedback, id: docRef.id };
  },

  async getAll(chatbotId: string) {
    const q = query(
      collection(db, 'feedback'),
      where('chatbot_id', '==', chatbotId),
      orderBy('created_at', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Feedback[];
  }
};