export default function KeyGenerator(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      key += characters[randomIndex];
    }
  
    return key;
  }