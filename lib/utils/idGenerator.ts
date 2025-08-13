// lib/utils/idGenerator.ts

let counter = 0;

export function generateUniqueId(prefix: string = 'id'): string {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 10000);
  counter = (counter + 1) % 10000;
  
  return `${prefix}-${timestamp}-${randomNum}-${counter}`;
}

export function generateToastId(): string {
  return generateUniqueId('toast');
}
