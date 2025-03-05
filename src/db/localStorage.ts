export const setItem = (key: string, value: any) => {
    const storageData = JSON.parse(localStorage.getItem('intent') || '{}');
    storageData[key] = value;
    localStorage.setItem('intent', JSON.stringify(storageData));
};

export const getItem = (key: string) => {
    const storageData = JSON.parse(localStorage.getItem('intent') || '{}');
    return storageData[key] !== undefined ? storageData[key] : null;
};
