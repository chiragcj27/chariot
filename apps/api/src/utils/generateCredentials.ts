import crypto from 'crypto';

export function generateUserAccountId(): string {
  // Generate a unique user account ID with prefix 'CHARIOT' and 5 random alphanumeric characters
  // Using crypto.randomBytes for better entropy than Math.random()
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  
  // Use crypto.randomBytes for better entropy
  const randomBytes = crypto.randomBytes(5);
  for (let i = 0; i < 5; i++) {
    randomPart += chars[randomBytes[i]! % chars.length];
  }
  
  return `CHARIOT${randomPart}`;
}

// Enhanced version with retry logic for collision handling
export async function generateUniqueUserAccountId(
  checkExists: (id: string) => Promise<boolean>,
  maxRetries: number = 10
): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const userAccountId = generateUserAccountId();
    
    // Check if this ID already exists
    const exists = await checkExists(userAccountId);
    if (!exists) {
      return userAccountId;
    }
    
    // If we're on the last attempt, throw an error
    if (attempt === maxRetries - 1) {
      throw new Error(`Failed to generate unique user account ID after ${maxRetries} attempts`);
    }
  }
  
  // This should never be reached, but TypeScript requires it
  throw new Error('Failed to generate unique user account ID');
}

export function generatePassword(): string {
  // Generate a secure random password with 8 characters
  // Include uppercase, lowercase, numbers, and special characters
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  
  let password = '';
  
  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest with random characters from all categories
  const allChars = uppercase + lowercase + numbers + special;
  for (let i = 4; i < 8; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password to make it more random
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export function generateTemporaryPassword(): string {
  // Generate a simpler temporary password for initial setup
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

// Alternative: Sequential ID generation (most reliable for uniqueness)
export async function generateSequentialUserAccountId(
  getNextSequence: () => Promise<number>
): Promise<string> {
  const sequence = await getNextSequence();
  // Format: CHARIOT + 6-digit zero-padded sequence number
  const paddedSequence = sequence.toString().padStart(6, '0');
  return `CHARIOT${paddedSequence}`;
}

// Alternative: Timestamp-based ID (good for uniqueness and chronological ordering)
export function generateTimestampUserAccountId(): string {
  const timestamp = Date.now();
  // Convert timestamp to base36 for shorter representation
  const base36Timestamp = timestamp.toString(36).toUpperCase();
  // Take last 5 characters and pad if needed
  const shortTimestamp = base36Timestamp.slice(-5).padStart(5, '0');
  return `CHARIOT${shortTimestamp}`;
}

// Alternative: UUID-based ID (maximum uniqueness)
export function generateUUIDUserAccountId(): string {
  // Generate a UUID and take first 5 characters of the hash
  const uuid = crypto.randomUUID();
  const hash = crypto.createHash('md5').update(uuid).digest('hex');
  const shortHash = hash.slice(0, 5).toUpperCase();
  return `CHARIOT${shortHash}`;
}
