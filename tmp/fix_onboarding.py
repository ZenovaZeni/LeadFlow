
import os

filepath = r'c:\Josh\Projects\SMS Lead Template\src\pages\AppDashboard.jsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update isAdmin (if not already done)
old_admin = "const isAdmin = user?.email === 'jdouglas8585@gmail.com'"
new_admin = "const isAdmin = user?.email === 'jdouglas8585@gmail.com' || user?.email === 'officialzenovaai@gmail.com'"
content = content.replace(old_admin, new_admin)

# 2. Update handleFinish and Skip button
old_handle_finish = """   const handleFinish = async () => {
    if (!name) return alert('Enter business name');
    
    if (!isDemo) {
      try {
        const { data: business, error: bizError } = await supabase
          .from('businesses')
          .insert([{ user_id: (await supabase.auth.getUser()).data.user?.id, name }])
          .select()
          .single()

        if (bizError) throw bizError
        
        if (business) {
          await createSampleLead(business.id)
        }
      } catch (err) {
        console.error('Error in onboarding finish:', err)
        alert('Failed to save business profile')
        return
      }
    }
    
    onComplete(name);
  };"""

new_handle_finish = """   const handleFinish = async () => {
    if (!name) return alert('Enter business name');
    
    if (!isDemo) {
      try {
        const { data: userData } = await supabase.auth.getUser()
        const userId = userData.user?.id
        
        // 1. Check if business already exists (prevent duplicate key error)
        const { data: existingBiz } = await supabase
          .from('businesses')
          .select('id')
          .eq('user_id', userId)
          .single()
          
        if (existingBiz) {
          onComplete(name)
          return
        }

        // 2. Insert new business
        const { data: business, error: bizError } = await supabase
          .from('businesses')
          .insert([{ user_id: userId, name }])
          .select()
          .single()

        if (bizError) throw bizError
        
        if (business) {
          await createSampleLead(business.id)
        }
      } catch (err) {
        console.error('Error in onboarding finish:', err)
        alert(`Failed to save business profile: ${err.message || 'Unknown error'}`)
        return
      }
    }
    
    onComplete(name);
  };"""

content = content.replace(old_handle_finish, new_handle_finish)

# 3. Add Skip Button UI
old_ui = """             <button onClick={handleFinish} className="w-full p-6 bg-indigo-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-900/20 hover:bg-slate-900 transition-all">Complete Setup</button>
          </div>"""

new_ui = """             <button onClick={handleFinish} className="w-full p-6 bg-indigo-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-900/20 hover:bg-slate-900 transition-all">Complete Setup</button>
             
             <div className="pt-4 border-t border-slate-100/50 mt-4 text-center">
                <button 
                  onClick={() => window.location.reload()} 
                  className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-all px-4 py-2"
                >
                  Did your leadflow agent already set you up? <br/>
                  <span className="text-indigo-600 mt-1 inline-block">Skip here and enter your dashboard</span>
                </button>
             </div>
          </div>"""

content = content.replace(old_ui, new_ui)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully updated AppDashboard.jsx")
