
export interface User {
    id: string;
    _id?: string;
    name: string;
    email: string;
    phone: string;
    role: 'STUDENT' | 'AGENT' | 'ADMIN';
    verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    isBlocked: boolean;
}

export interface Hostel {
    id: string;
    _id?: string;
    title: string;
    description: string;
    price: number;
    rent: number;
    cautionFee: number;
    agentFee: number;
    totalPackage: number;
    propertyType: string;
    preferredTenants: string[];
    inspectionFee: number;
    location: string;
    images: (string | { url: string; description?: string })[];
    videos?: (string | { url: string; description?: string })[];
    longitude?: number;
    latitude?: number;
    damages?: {
        description: string;
        media: { url: string; type: 'image' | 'video' }[];
        reportedAt: string;
        repairedAt?: string;
        status: 'Broken' | 'Pending' | 'Repaired';
        fineAmount: number;
    }[];
    amenities: string[];
    rules: string[];
    agentId: string | User;
}

export interface Booking {
    id: string;
    _id?: string;
    studentId: string | User;
    hostelId: string | Hostel;
    amount: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    createdAt: string;
    hostel?: Hostel;
}

export interface Wallet {
    id: string;
    _id?: string;
    balance: number;
    escrowBalance: number;
    transactions?: Transaction[];
}

export interface Transaction {
    id: string;
    _id?: string;
    amount: number;
    type: string;
    description: string;
    createdAt: string;
}

export interface Inspection {
    id: string;
    _id?: string;
    studentId: string | User;
    hostelId: string | Hostel;
    amount: number;
    status: 'PAID' | 'COMPLETED' | 'CANCELLED';
    inspectionDate?: string;
    createdAt: string;
}

export interface Notification {
    _id: string;
    recipient: string;
    sender?: string;
    type: 'booking' | 'payment' | 'system' | 'message' | 'inspection';
    title: string;
    message: string;
    link?: string;
    read: boolean;
    createdAt: string;
}
