export type UserRole = 'Admin' | 'Student';

export enum EventCategory {
  CONFERENCE = 'Conference',
  SPORT = 'Sport',
  WORKSHOP = 'Workshop',
  OTHER = 'Other'
}

export interface Users {
  id: number;
  fullName: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface StJeanEvent {
  id: number;
  title: string;
  description: string;
  date: string; // ISO String
  location: string;
  category: EventCategory;
  maxCapacity: number;
  imageUrl?: string;
  organizerId: number;
}

export interface Registration {
  id: number;
  eventId: number;
  userId: number;
  userFullName: string;
  registrationDate: string;
}

export class DataStore {
  // Load data from LocalStorage
  static users: Users[] = this.loadData('users');
  static events: StJeanEvent[] = this.loadData('events');
  static registrations: Registration[] = this.loadData('registrations');

  // ID Trackers
  static nextUserId = this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1;
  static nextEventId = this.events.length > 0 ? Math.max(...this.events.map(e => e.id)) + 1 : 1;
  static nextRegId = this.registrations.length > 0 ? Math.max(...this.registrations.map(r => r.id)) + 1 : 1;

  // --- Persistence Helpers ---
  private static saveData(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private static loadData(key: string): any[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  // --- User Logic ---
  static addUser(userData: Omit<Users, 'id'>): Users {
    const newUser: Users = { id: this.nextUserId++, ...userData };
    this.users.push(newUser);
    this.saveData('users', this.users);
    return newUser;
  }

  static login(username: string, password: string): Users | undefined {
    return this.users.find(u => u.username === username && u.password === password);
  }

  static signUp(fullName: string, username: string, email: string, password: string): boolean {
    if (this.users.some(u => u.username === username || u.email === email)) return false;
    this.addUser({ fullName, username, email, password, role: 'Student' });
    return true;
  }

  static getUserById(id: number): Users | undefined {
    return this.users.find(u => u.id === id);
  }

  // --- Event Logic ---
  static addEvent(eventData: Omit<StJeanEvent, 'id'>): StJeanEvent {
    const newEvent: StJeanEvent = { id: this.nextEventId++, ...eventData };
    this.events.push(newEvent);
    this.saveData('events', this.events);
    return newEvent;
  }

  static deleteEvent(eventId: number): void {
    this.events = this.events.filter(e => e.id !== eventId);
    this.registrations = this.registrations.filter(r => r.eventId !== eventId); // Cascade delete
    this.saveData('events', this.events);
    this.saveData('registrations', this.registrations);
  }

  static registerUser(eventId: number, userId: number, userFullName: string): { success: boolean, message: string } {
    const event = this.events.find(e => e.id === eventId);
    if (!event) return { success: false, message: "Event not found." };

    
    const existing = this.registrations.find(r => r.eventId === eventId && r.userId === userId);
    if (existing) return { success: false, message: "You are already registered." };

   
    const currentCount = this.registrations.filter(r => r.eventId === eventId).length;
    if (currentCount >= event.maxCapacity) return { success: false, message: "Event is full." };

   
    const newReg: Registration = {
      id: this.nextRegId++,
      eventId,
      userId,
      userFullName,
      registrationDate: new Date().toISOString()
    };
    this.registrations.push(newReg);
    this.saveData('registrations', this.registrations);
    
    return { success: true, message: "Registration successful!" };
  }

  static getEventStats(eventId: number) {
    const count = this.registrations.filter(r => r.eventId === eventId).length;
    return { count };
  }

  
  static {
    if (!this.users.some(u => u.role === 'Admin')) {
      this.addUser({ fullName: "System Admin", username: "admin", email: "admin@stjean.edu", password: "123", role: 'Admin' });
    }
  }
}