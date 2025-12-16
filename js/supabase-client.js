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

  async getAllInviteCodes() {
    return this.request('GET', 'invite_codes');
  }
}

// Create global Supabase client instance
const supabase = new SupabaseClient(supabaseUrl, supabaseKey);
