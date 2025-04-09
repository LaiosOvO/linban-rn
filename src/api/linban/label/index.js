import instance from '../../../utils/axios';

// label page
export const getLabelUserPage = param => instance.get('linban/label/page', {params: param});

export const listLabelUserPage = param => instance.get('linban/label/list', {params: param});


// save label 
export const saveLabelUser = data => instance.post('linban/label/create', data);


export const updateLabelUser = data =>
    instance.put('linban/label/update', {data});

export const deleteLabelUser = data => instance.delete('linban/label/delete?id=' + data.id);

