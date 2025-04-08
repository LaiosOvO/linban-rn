import instance from '../utils/axios/index';

// 获得林班-收藏夹分页
export const page = params => instance.get('linban/start-folder/page', params);

// 获得林班-收藏夹分页
export const addFolder = params => instance.post('linban/start-folder/create', params);

// 获得林班-标记点分页
export const labelList = params => instance.get('/linban/label/page', params);
