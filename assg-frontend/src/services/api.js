import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

//axios.interceptors.request.use(config => {})

export const loginapi = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
}

export const registerapi = async (name, email, password, userClass = null, role = 'STUDENT') => {
    const response = await api.post('/auth/register', { name, email, password, userClass });
    return response.data;
}

export const logoutapi = async () => {
    const response = await api.post('/auth/logout');
    return response.data;
}

export const apime = async () => {
    const response = await api.get('/auth/me');
    return response.data;
}

export const dashboardapi = async () => {
    const response = await api.get('/auth/dashboard');
    return response.data;
}

export const staffapi = async (name, email, password, userClass = null, role = 'STAFF') => {
    const requestData = { name, email, password, role };
    if (userClass) {
        requestData.sclass = userClass;
    }
    const response = await api.post('/staff/create', requestData);
    return response.data;
}

export const stafflistapi = async (searchQuery = null, page = 1, limit = 10, classFilter = null) => {
    let params = new URLSearchParams();
    
    if (searchQuery) {
        params.append('search', searchQuery);
    }
    if (classFilter) {
        params.append('class', classFilter);
    }
    if (page) {
        params.append('page', page);
    }
    if (limit) {
        params.append('limit', limit);
    }
    
    const queryString = params.toString();
    const url = queryString ? `/staff/stafflist?${queryString}` : "/staff/stafflist";
    const response = await api.get(url);
    return response.data;
}

export const allStudentsList = async (searchQuery = null, page = 1, limit = 10) => {
    let params = new URLSearchParams();
    
    if (searchQuery) {
        params.append('search', searchQuery);
    }
    if (page) {
        params.append('page', page);
    }
    if (limit) {
        params.append('limit', limit);
    }
    
    const queryString = params.toString();
    const url = queryString ? `/auth/studentslist?${queryString}` : "/auth/studentslist";
    const response = await api.get(url);
    return response.data;
}

export const getEquipmentList = async (searchQuery, page = 1, limit = 10, category = null, condition = null) => {
    let params = new URLSearchParams();
    
    if (searchQuery) {
        params.append('search', searchQuery);
    }
    if (category) {
        params.append('category', category);
    }
    if (condition) {
        params.append('condition', condition);
    }
    if (page) {
        params.append('page', page);
    }
    if (limit) {
        params.append('limit', limit);
    }
    
    const queryString = params.toString();
    const url = queryString ? `/equip/get?${queryString}` : "/equip/get";
    const response = await api.get(url);
    return response.data;
}

export const createSingleEquipment = async (ename, category, condition, quantity) => {
    const rawd = { ename, category, condition, quantity }
    const response = await api.post("/equip/create", rawd)
    return response.data
}

export const updateEquipments = async(equipID,ename, category, condition, quantity) =>{
    const rawd = { ename, category, condition, quantity }
    const response = await api.put(`/equip/update/${equipID}`,rawd)
    return response.data
}

export const deleteEquipments = async(equipID)=>{
    const response = await api.delete(`/equip/delete/${equipID}`)
    return response.data
}

export const requestEquipments = async(equipID, quantity, fromDate, toDate) =>{
    const rawd = {quantity, fromDate, toDate}
    const response = await api.post(`/equip/request/${equipID}`,rawd)
    return response.data
}

export const getMyReservations = async (searchQuery = null, page = 1, limit = 10, status = null) => {
    let params = new URLSearchParams();
    
    if (searchQuery) {
        params.append('search', searchQuery);
    }
    if (status) {
        params.append('status', status);
    }
    if (page) {
        params.append('page', page);
    }
    if (limit) {
        params.append('limit', limit);
    }
    
    const queryString = params.toString();
    const url = queryString ? `/equip/reservations/my?${queryString}` : "/equip/reservations/my";
    const response = await api.get(url);
    return response.data;
}

export const getAllReservations = async (searchQuery = null, page = 1, limit = 10, category = null, status = null) => {
    let params = new URLSearchParams();
    
    if (searchQuery) {
        params.append('search', searchQuery);
    }
    if (category) {
        params.append('category', category);
    }
    if (status) {
        params.append('status', status);
    }
    if (page) {
        params.append('page', page);
    }
    if (limit) {
        params.append('limit', limit);
    }
    
    const queryString = params.toString();
    const url = queryString ? `/equip/reservations/all?${queryString}` : "/equip/reservations/all";
    const response = await api.get(url);
    return response.data;
}

export const returnEquipment = async(reservationID) => {
    const response = await api.post(`/equip/return/${reservationID}`)
    return response.data
}

export const acceptEquipment = async(reservationID) => {
    const response = await api.post(`/equip/accept/${reservationID}`)
    return response.data
}

export const rejectEquipment = async(reservationID) => {
    const response = await api.post(`/equip/reject/${reservationID}`)
    return response.data
}