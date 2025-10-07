// Coding feature removed in this deployment.
// All controller actions return 410 to indicate removal.
module.exports = {
  listChallenges: (req, res) => res.status(410).json({ message: 'Coding feature removed' }),
  createChallenge: (req, res) => res.status(410).json({ message: 'Coding feature removed' }),
  updateChallenge: (req, res) => res.status(410).json({ message: 'Coding feature removed' }),
  deleteChallenge: (req, res) => res.status(410).json({ message: 'Coding feature removed' }),
  runCode: (req, res) => res.status(410).json({ message: 'Coding feature removed' }),
  submitCode: (req, res) => res.status(410).json({ message: 'Coding feature removed' }),
  mySubmissions: (req, res) => res.status(410).json({ message: 'Coding feature removed' }),
};
