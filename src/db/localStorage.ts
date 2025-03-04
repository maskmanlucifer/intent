export const setItem = (key: string, value: any) => {
    const storageData = JSON.parse(localStorage.getItem('data') || '{}');
    storageData[key] = value;
    localStorage.setItem('data', JSON.stringify(storageData));
};

export const getItem = (key: string) => {
    const storageData = JSON.parse(localStorage.getItem('data') || '{}');
    return storageData[key] !== undefined ? storageData[key] : null;
};

export const removeItem = (key: string) => {
    const storageData = JSON.parse(localStorage.getItem('data') || '{}');
    delete storageData[key];
    localStorage.setItem('data', JSON.stringify(storageData));
};

export const clearStorage = () => {
    localStorage.removeItem('data');
};
