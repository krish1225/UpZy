// ============================================
// SUPABASE CLIENT INTEGRATION
// ============================================

// Supabase Configuration
const SUPABASE_CONFIG = {
  URL: 'https://ptokzqclcjdfvyijzmgk.supabase.co',
  KEY: 'sb_publishable_hHuJuOywQxJXeRXTj3mMmQ_vmvT5y4M'
};

// Initialize Supabase Client
const supabaseUrl = SUPABASE_CONFIG.URL;
const supabaseKey = SUPABASE_CONFIG.KEY;

// Simple Supabase REST API client (no SDK dependency)
class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
  }

  async request(method, table, data = null, filters = {}) {
    let url = `${this.url}/rest/v1/${table}`;
    
    // Add filters to URL
    const filterParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      filterParams.append(key, `eq.${value}`);
    });
    if (filterParams.toString()) {
      url += `?${filterParams.toString()}`;
    }

    const options = {
      method,
      headers: {
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      console.log(`[Supabase] ${method} ${table}`, data);
      const response = await fetch(url, options);
      const result = await response.json();
      
      if (!response.ok) {
        console.error('Supabase error:', result);
        throw new Error(result.message || 'Database error');
      }
      
      console.log(`[Supabase] Success:`, result);
      return result;
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }

  // Participants
  async addParticipant(email) {
    return this.request('POST', 'participants', { email });
  }

  async getParticipants() {
    return this.request('GET', 'participants');
  }

  // Submissions
  async addSubmission(email, date, steps, calories) {
    return this.request('POST', 'submissions', {
      email,
      submission_date: date,
      steps: parseInt(steps),
      calories: parseInt(calories)
    });
  }

  async upsertSubmission(email, date, steps, calories) {
    // Try to insert, if duplicate key error then update
    try {
      return await this.addSubmission(email, date, steps, calories);
    } catch (error) {
      if (error.message.includes('duplicate')) {
        // Update existing submission
        let url = `${this.url}/rest/v1/submissions?email=eq.${email}&submission_date=eq.${date}`;
        const options = {
          method: 'PATCH',
          headers: {
            'apikey': this.key,
            'Authorization': `Bearer ${this.key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            steps: parseInt(steps),
            calories: parseInt(calories)
          })
        };
        const response = await fetch(url, options);
        return await response.json();
      }
      throw error;
    }
  }

  async getSubmissions(filters = {}) {
    return this.request('GET', 'submissions', null, filters);
  }

  async getUserSubmissions(email) {
    let url = `${this.url}/rest/v1/submissions?email=eq.${email}`;
    const options = {
      headers: {
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`,
        'Content-Type': 'application/json'
      }
    };
    
    try {
      const response = await fetch(url, options);
      return await response.json();
    } catch (error) {
      console.error('Failed to get user submissions:', error);
      return [];
    }
  }

  // Invite Codes
  async addInviteCode(code, email) {
    return this.request('POST', 'invite_codes', { code, email });
  }

  async getInviteCode(code) {
    let url = `${this.url}/rest/v1/invite_codes?code=eq.${code}`;
    const options = {
      headers: {
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`,
        'Content-Type': 'application/json'
      }
    };
    
    try {
      const response = await fetch(url, options);
      const result = await response.json();
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Failed to get invite code:', error);
      return null;
    }
  }

  async validateInviteCode(code) {
    const inviteCode = await this.getInviteCode(code);
    return inviteCode !== null;
  }

  async getAllInviteCodes() {
    return this.request('GET', 'invite_codes');
  }

  // User Authentication
  async createUser(email, password) {
    return this.request('POST', 'users', { email, password });
  }

  async getUser(email) {
    let url = `${this.url}/rest/v1/users?email=eq.${email}`;
    const options = {
      headers: {
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`,
        'Content-Type': 'application/json'
      }
    };
    
    try {
      const response = await fetch(url, options);
      const result = await response.json();
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  }

  async updateUserPassword(email, password) {
    let url = `${this.url}/rest/v1/users?email=eq.${email}`;
    const options = {
      method: 'PATCH',
      headers: {
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ password })
    };
    
    try {
      const response = await fetch(url, options);
      return await response.json();
    } catch (error) {
      console.error('Failed to update password:', error);
      throw error;
    }
  }

  // Participants
  async getParticipants() {
    return this.request('GET', 'participants');
  }

  async addParticipant(email) {
    return this.request('POST', 'participants', { email, joined_at: new Date().toISOString() });
  }

  // Challenges
  async createChallenge(name, duration, startDate, description) {
    return this.request('POST', 'challenges', {
      name,
      duration,
      start_date: startDate,
      description,
      status: 'active'
    });
  }

  async getChallenges() {
    return this.request('GET', 'challenges');
  }

  async getChallengeById(id) {
    let url = `${this.url}/rest/v1/challenges?id=eq.${id}`;
    const options = {
      headers: {
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`,
        'Content-Type': 'application/json'
      }
    };
    
    try {
      const response = await fetch(url, options);
      const result = await response.json();
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Failed to get challenge:', error);
      return null;
    }
  }

  // User Challenge Progress
  async addUserToChallenge(email, challengeId) {
    // First check if user is already assigned to this challenge
    try {
      const existingUrl = `${this.url}/rest/v1/user_challenge_progress?email=eq.${email}&challenge_id=eq.${challengeId}`;
      const checkOptions = {
        headers: {
          'apikey': this.key,
          'Authorization': `Bearer ${this.key}`,
          'Content-Type': 'application/json'
        }
      };
      
      const checkResponse = await fetch(existingUrl, checkOptions);
      const existing = await checkResponse.json();
      
      if (existing && existing.length > 0) {
        // User already assigned - update the status to active
        console.log(`[Supabase] User already assigned, updating status for ${email}...`);
        
        const updateUrl = `${this.url}/rest/v1/user_challenge_progress?email=eq.${email}&challenge_id=eq.${challengeId}`;
        const updateOptions = {
          method: 'PATCH',
          headers: {
            'apikey': this.key,
            'Authorization': `Bearer ${this.key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            status: 'active',
            joined_at: new Date().toISOString()
          })
        };
        
        const updateResponse = await fetch(updateUrl, updateOptions);
        const result = await updateResponse.json();
        
        if (!updateResponse.ok) {
          throw new Error(result.message || `HTTP ${updateResponse.status}`);
        }
        
        console.log(`[Supabase] Updated assignment for ${email}:`, result);
        return result;
      } else {
        // User not assigned yet - insert new record
        console.log(`[Supabase] New assignment, inserting ${email}...`);
        
        const insertUrl = `${this.url}/rest/v1/user_challenge_progress`;
        const insertOptions = {
          method: 'POST',
          headers: {
            'apikey': this.key,
            'Authorization': `Bearer ${this.key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            email,
            challenge_id: challengeId,
            joined_at: new Date().toISOString(),
            status: 'active'
          })
        };
        
        const insertResponse = await fetch(insertUrl, insertOptions);
        const result = await insertResponse.json();
        
        if (!insertResponse.ok) {
          throw new Error(result.message || `HTTP ${insertResponse.status}`);
        }
        
        console.log(`[Supabase] Inserted assignment for ${email}:`, result);
        return result;
      }
    } catch (error) {
      console.error(`[Supabase] Failed to add/update user to challenge:`, error);
      throw error;
    }
  }

  async getUserChallenges(email) {
    let url = `${this.url}/rest/v1/user_challenge_progress?email=eq.${email}`;
    const options = {
      headers: {
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`,
        'Content-Type': 'application/json'
      }
    };
    
    try {
      const response = await fetch(url, options);
      return await response.json();
    } catch (error) {
      console.error('Failed to get user challenges:', error);
      return [];
    }
  }

  async getChallengeProgress(email, challengeId) {
    let url = `${this.url}/rest/v1/user_challenge_progress?email=eq.${email}&challenge_id=eq.${challengeId}`;
    const options = {
      headers: {
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`,
        'Content-Type': 'application/json'
      }
    };
    
    try {
      const response = await fetch(url, options);
      const result = await response.json();
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Failed to get challenge progress:', error);
      return null;
    }
  }

  async updateUserChallengeProgress(email, challengeId, data) {
    let url = `${this.url}/rest/v1/user_challenge_progress?email=eq.${email}&challenge_id=eq.${challengeId}`;
    const options = {
      method: 'PATCH',
      headers: {
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    };
    
    try {
      const response = await fetch(url, options);
      return await response.json();
    } catch (error) {
      console.error('Failed to update challenge progress:', error);
      throw error;
    }
  }

  async getChallengeParticipants(challengeId) {
    let url = `${this.url}/rest/v1/user_challenge_progress?challenge_id=eq.${challengeId}`;
    const options = {
      headers: {
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`,
        'Content-Type': 'application/json'
      }
    };
    
    try {
      const response = await fetch(url, options);
      const result = await response.json();
      return result.map(item => ({ email: item.email, ...item })) || [];
    } catch (error) {
      console.error('Failed to get challenge participants:', error);
      return [];
    }
  }
}

// Create global Supabase client instance
const supabase = new SupabaseClient(supabaseUrl, supabaseKey);

