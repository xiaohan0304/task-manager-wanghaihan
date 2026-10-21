const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============替换为你的Supabase信息============
const SUPABASE_URL = "https://imiubgebqcjdktxpcnfu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_upzu3K4MaTtcijUBfP49kg_T1qx9V1H";
// ==============================================

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 获取任务，支持优先级筛选，创建时间倒序
app.get('/api/tasks', async (req, res) => {
  const { filter } = req.query;
  let query = supabase.from('tasks').select('*').order('created_at', { ascending: false });
  if (filter && filter !== '全部') {
    query = query.eq('priority', filter);
  }
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// 新增任务
app.post('/api/tasks', async (req, res) => {
  const { title, priority } = req.body;
  if (!title || !priority) {
    return res.status(400).json({ error: "任务标题、优先级不能为空" });
  }
  const { data, error } = await supabase.from('tasks').insert([{ title, priority }]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

// 更新完成状态
app.patch('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { is_completed } = req.body;
  const { data, error } = await supabase.from('tasks').update({ is_completed }).eq('id', id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

// 删除任务
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// 前端入口
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`本地服务启动：http://localhost:${PORT}`);
});
