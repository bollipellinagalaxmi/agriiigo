let instance;
export const setIo = io => { instance = io; };
export const emitBooking = (id, event, data) => instance?.to(`booking:${id}`).emit(event, data);
export const emitUser = (id, event, data) => instance?.to(`user:${id}`).emit(event, data);
