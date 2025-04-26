import { db } from '../config/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

// New quests to add to the database
export const bulkQuests = [
