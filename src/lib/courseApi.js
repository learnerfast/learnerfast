import { supabase } from './supabase';

// Course CRUD operations
export const courseApi = {
  // Get all courses for user
  async getCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create new course
  async createCourse(courseData) {
    const { data, error } = await supabase
      .from('courses')
      .insert([courseData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update course
  async updateCourse(id, updates) {
    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete course
  async deleteCourse(id) {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Course Settings
  async getCourseSettings(courseId) {
    const { data, error } = await supabase
      .from('course_settings')
      .select('*')
      .eq('course_id', courseId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async upsertCourseSettings(courseId, settings) {
    const { data, error } = await supabase
      .from('course_settings')
      .upsert({ course_id: courseId, ...settings })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Course Access
  async getCourseAccess(courseId) {
    const { data, error } = await supabase
      .from('course_access')
      .select('*')
      .eq('course_id', courseId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async upsertCourseAccess(courseId, access) {
    const { data, error } = await supabase
      .from('course_access')
      .upsert({ course_id: courseId, ...access })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Course Pricing
  async getCoursePricing(courseId) {
    const { data, error } = await supabase
      .from('course_pricing')
      .select('*')
      .eq('course_id', courseId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async upsertCoursePricing(courseId, pricing) {
    const { data, error } = await supabase
      .from('course_pricing')
      .upsert({ course_id: courseId, ...pricing })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Course Sections
  async getCourseSections(courseId) {
    const { data, error } = await supabase
      .from('course_sections')
      .select('*, course_activities(*)')
      .eq('course_id', courseId)
      .order('order_index');
    
    if (error) throw error;
    return data;
  },

  async createSection(sectionData) {
    const { data, error } = await supabase
      .from('course_sections')
      .insert([sectionData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateSection(id, updates) {
    const { data, error } = await supabase
      .from('course_sections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteSection(id) {
    const { error } = await supabase
      .from('course_sections')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Course Activities
  async createActivity(activityData) {
    const { data, error } = await supabase
      .from('course_activities')
      .insert([activityData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateActivity(id, updates) {
    const { data, error } = await supabase
      .from('course_activities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteActivity(id) {
    const { error } = await supabase
      .from('course_activities')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Course Automations
  async getCourseAutomations(courseId) {
    const { data, error } = await supabase
      .from('course_automations')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createAutomation(automationData) {
    const { data, error } = await supabase
      .from('course_automations')
      .insert([automationData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateAutomation(id, updates) {
    const { data, error } = await supabase
      .from('course_automations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteAutomation(id) {
    const { error } = await supabase
      .from('course_automations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Course Page Layout
  async getCoursePageLayout(courseId) {
    const { data, error } = await supabase
      .from('course_page_layout')
      .select('*')
      .eq('course_id', courseId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async upsertCoursePageLayout(courseId, layout) {
    const { data, error } = await supabase
      .from('course_page_layout')
      .upsert({ course_id: courseId, ...layout })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};