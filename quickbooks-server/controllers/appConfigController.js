const getAppConfig = (req, res) => {
  res.json({
    supabase: {
      url: process.env.SUPABASE_URL || "https://dummy-project.supabase.co",
      anonKey: process.env.SUPABASE_ANON_KEY || "dummy-anon-key-ey...",
    },
  });
};

module.exports = {
  getAppConfig,
};
