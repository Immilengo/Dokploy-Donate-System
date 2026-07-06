export interface UpdateProfileDto{
    fullName?: string;
    phone?: string; 
}

export interface UpdateUserbyAdminDto{
    fullName?: string;
    phone?: string;
    role?: 'USER' | 'ADMIN';
    recordStatus?: 'ACTIVE' | 'INACTIVE';
}