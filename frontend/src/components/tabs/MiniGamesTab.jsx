import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Trophy, Zap, X, RefreshCw, Star, CheckCircle, Gamepad2, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { loyaltyAPI, notificationAPI } from '../../services/api';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

// Game data
const QUIZ_QUESTIONS = [
  {
    question: "What is the most popular Sri Lankan breakfast?",
    options: ["String Hoppers", "Fried Rice", "Pizza", "Burger"],
    correct: 0,
    points: 10,
  },
  {
    question: "Which food is traditionally eaten with sambol?",
    options: ["Pizza", "Burger", "Rice & Curry", "Pasta"],
    correct: 2,
    points: 10,
  },
  {
    question: "What's the main ingredient in Kottu?",
    options: ["Noodles", "Bread (Roti)", "Rice", "Pasta"],
    correct: 1,
    points: 10,
  },
  {
    question: "Best time to order on campus to avoid rush?",
    options: ["12-1 PM", "Before 11 AM", "2-3 PM", "After 8 PM"],
    correct: 1,
    points: 15,
  },
];

const SPIN_PRIZES = [
  { label: "5 Points", value: 5, color: "from-blue-400 to-blue-600" },
  { label: "10 Points", value: 10, color: "from-green-400 to-green-600" },
  { label: "15 Points", value: 15, color: "from-yellow-400 to-yellow-600" },
  { label: "20 Points", value: 20, color: "from-orange-400 to-orange-600" },
  { label: "25 Points", value: 25, color: "from-red-400 to-red-600" },
  { label: "50 Points", value: 50, color: "from-purple-400 to-purple-600" },
  { label: "Try Again", value: 0, color: "from-gray-400 to-gray-600" },
  { label: "5 Points", value: 5, color: "from-pink-400 to-pink-600" },
];

const SCRATCH_PRIZES = [
  { emoji: "🎁", points: 5 },
  { emoji: "⭐", points: 10 },
  { emoji: "💎", points: 15 },
  { emoji: "🏆", points: 20 },
  { emoji: "🎯", points: 25 },
  { emoji: "👎", points: 0 },
  { emoji: "🎁", points: 5 },
  { emoji: "⭐", points: 10 },
  { emoji: "💎", points: 15 },
];

// Confetti animation
const fireConfetti = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;

  const randomInRange = (min, max) => Math.random() * (max - min) + min;

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    confetti({
      particleCount: 3,
      angle: randomInRange(55, 125),
      spread: randomInRange(50, 70),
      origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
      colors: ['#FFD700', '#FFA500', '#FF6347', '#87CEEB', '#98FB98'],
    });
  }, 50);
};

const MiniGamesTab = () => {
  const { currentUser, loyaltyData, refreshLoyaltyData } = useApp();
  const [selectedGame, setSelectedGame] = useState(null);
  const [dailyPlays, setDailyPlays] = useState({ spin: 0, scratch: 0, quiz: 0 });
  const [totalPointsWon, setTotalPointsWon] = useState(0);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [animatedPoints, setAnimatedPoints] = useState(0);

  // Load from localStorage when currentUser is available
  useEffect(() => {
    if (!currentUser?.userId) return;
    const today = new Date().toDateString();
    
    const savedPlays = localStorage.getItem(`dailyPlays_${currentUser.userId}_${today}`);
    if (savedPlays) setDailyPlays(JSON.parse(savedPlays));
    
    const savedPoints = localStorage.getItem(`pointsWon_${currentUser.userId}_${today}`);
    if (savedPoints) setTotalPointsWon(parseInt(savedPoints));
  }, [currentUser?.userId]);

  // Save to localStorage when state changes
  useEffect(() => {
    if (!currentUser?.userId) return;
    const today = new Date().toDateString();
    localStorage.setItem(`dailyPlays_${currentUser.userId}_${today}`, JSON.stringify(dailyPlays));
  }, [dailyPlays, currentUser?.userId]);

  useEffect(() => {
    if (!currentUser?.userId) return;
    const today = new Date().toDateString();
    localStorage.setItem(`pointsWon_${currentUser.userId}_${today}`, totalPointsWon.toString());
  }, [totalPointsWon, currentUser?.userId]);

  const games = [
    {
      id: 'spin',
      name: 'Spin the Wheel',
      emoji: '🎡',
      description: 'Spin to win up to 50 points!',
      playsLeft: 3 - (dailyPlays.spin || 0),
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'scratch',
      name: 'Scratch Card',
      emoji: '🎫',
      description: 'Scratch to reveal your prize!',
      playsLeft: 3 - (dailyPlays.scratch || 0),
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'quiz',
      name: 'Food Quiz',
      emoji: '🧠',
      description: 'Test your food knowledge!',
      playsLeft: 5 - (dailyPlays.quiz || 0),
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const handleGameComplete = async (gameId, points) => {
    if (points > 0) {
      try {
        // Show points animation
        setAnimatedPoints(points);
        setShowPointsAnimation(true);
        fireConfetti();

        // Add points to loyalty account
        await loyaltyAPI.addPoints({
          userId: currentUser.userId,
          amount: points,
          description: `Mini-Game Reward - ${gameId === 'spin' ? 'Spin Wheel' : gameId === 'scratch' ? 'Scratch Card' : 'Food Quiz'}`,
        });

        // Create notification
        await notificationAPI.create({
          userId: currentUser.userId,
          type: 'points_earned',
          title: '🎮 Mini-Game Reward!',
          message: `You earned ${points} points from ${gameId === 'spin' ? 'Spin the Wheel' : gameId === 'scratch' ? 'Scratch Card' : 'Food Quiz'}!`,
          icon: '🎮',
          data: { points, gameId },
        });

        // Update local state
        setDailyPlays(prev => ({ ...prev, [gameId]: (prev[gameId] || 0) + 1 }));
        setTotalPointsWon(prev => prev + points);

        // Refresh loyalty data
        await refreshLoyaltyData();

        // Hide animation after 3 seconds
        setTimeout(() => setShowPointsAnimation(false), 3000);

        // Success toast
        toast.success(`🎉 You earned ${points} points!`, {
          duration: 3000,
          icon: '⭐',
        });
      } catch (error) {
        console.error('Error adding points:', error);
        toast.error('Failed to add points. Please try again.');
      }
    } else {
      // No points won
      setDailyPlays(prev => ({ ...prev, [gameId]: (prev[gameId] || 0) + 1 }));
      toast('Better luck next time! 🍀', { icon: '😅' });
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Floating Points Animation */}
      <AnimatePresence>
        {showPointsAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 0 }}
            animate={{ opacity: 1, scale: 2, y: -100 }}
            exit={{ opacity: 0, scale: 0, y: -200 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: 3,
              }}
              className="text-8xl font-bold text-yellow-500 drop-shadow-2xl"
              style={{
                textShadow: '0 0 20px rgba(255,215,0,0.8), 0 0 40px rgba(255,215,0,0.5)',
              }}
            >
              +{animatedPoints} ⭐
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
      >
        {/* Animated Background */}
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-10 -right-10 text-9xl opacity-10"
        >
          🎮
        </motion.div>

        {/* Floating Stars */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            className="absolute text-4xl"
            style={{
              left: `${20 + i * 20}%`,
              top: `${20 + (i % 2) * 40}%`,
            }}
          >
            ✨
          </motion.div>
        ))}

        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="flex items-center gap-4 mb-4"
          >
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
            >
              <Gamepad2 className="w-10 h-10" />
            </motion.div>
            <div>
              <motion.h1
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-3xl font-bold"
              >
                Mini-Games
              </motion.h1>
              <p className="opacity-90">Play games, earn real points!</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
            >
              <div className="text-sm opacity-90">Points Won Today</div>
              <motion.div
                key={totalPointsWon}
                initial={{ scale: 1.5, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="text-3xl font-bold"
              >
                {totalPointsWon} ⭐
              </motion.div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
            >
              <div className="text-sm opacity-90">Your Total Points</div>
              <motion.div
                key={loyaltyData?.totalPoints}
                initial={{ scale: 1.5, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="text-3xl font-bold text-yellow-300"
              >
                {loyaltyData?.totalPoints || 0} 🏆
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Game Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <motion.span
            animate={{ rotate: [0, 20, -20, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎯
          </motion.span>
          Choose Your Game
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {games.map((game, index) => (
            <GameCard
              key={game.id}
              game={game}
              index={index}
              onClick={() => setSelectedGame(game.id)}
            />
          ))}
        </div>
      </motion.div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-orange-200 rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            💡
          </motion.span>
          How Mini-Games Work
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { emoji: '🎮', title: 'Play Daily', desc: 'Limited plays per day to keep it fair' },
            { emoji: '⭐', title: 'Earn Real Points', desc: 'Win 5-50 points that add to your account' },
            { emoji: '🏆', title: 'Use Points', desc: 'Redeem for rewards and discounts' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center bg-white rounded-xl p-4"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                className="text-4xl mb-2"
              >
                {item.emoji}
              </motion.div>
              <h4 className="font-bold mb-1">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Game Modals */}
      <AnimatePresence>
        {selectedGame === 'spin' && (
          <SpinWheelGame
            onClose={() => setSelectedGame(null)}
            onComplete={(points) => handleGameComplete('spin', points)}
            playsLeft={games[0].playsLeft}
          />
        )}
        {selectedGame === 'scratch' && (
          <ScratchCardGame
            onClose={() => setSelectedGame(null)}
            onComplete={(points) => handleGameComplete('scratch', points)}
            playsLeft={games[1].playsLeft}
          />
        )}
        {selectedGame === 'quiz' && (
          <QuizGame
            onClose={() => setSelectedGame(null)}
            onComplete={(points) => handleGameComplete('quiz', points)}
            playsLeft={games[2].playsLeft}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Game Card Component
const GameCard = ({ game, index, onClick }) => {
  const isAvailable = game.playsLeft > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{
        delay: index * 0.15,
        type: "spring",
        stiffness: 100,
      }}
      whileHover={isAvailable ? {
        scale: 1.08,
        y: -15,
        rotateY: 5,
        transition: { duration: 0.3 }
      } : {}}
      whileTap={isAvailable ? { scale: 0.95 } : {}}
      onClick={isAvailable ? onClick : null}
      className={`bg-gradient-to-br ${game.color} rounded-2xl p-6 text-white shadow-xl relative overflow-hidden ${isAvailable ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
        }`}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Shimmer Effect */}
      {isAvailable && (
        <motion.div
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2,
          }}
          className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
        />
      )}

      {/* Decorative Element */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
        className="absolute -top-8 -right-8 text-8xl opacity-20"
      >
        {game.emoji}
      </motion.div>

      <div className="relative z-10">
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: index * 0.3,
          }}
          className="text-5xl mb-3"
        >
          {game.emoji}
        </motion.div>
        <h3 className="text-2xl font-bold mb-2">{game.name}</h3>
        <p className="text-sm opacity-90 mb-4">{game.description}</p>

        <div className="flex items-center justify-between">
          <motion.div
            animate={isAvailable ? {
              scale: [1, 1.1, 1],
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold"
          >
            {game.playsLeft} plays left
          </motion.div>
          {isAvailable && (
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, 15, -15, 0],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Zap className="w-6 h-6" />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};


// Spin Wheel Game
const SpinWheelGame = ({ onClose, onComplete, playsLeft }) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [prize, setPrize] = useState(null);

  if (playsLeft <= 0) {
    return (
      <GameModal onClose={onClose}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏰</div>
          <h3 className="text-2xl font-bold mb-2">No Plays Left</h3>
          <p className="text-gray-600 mb-4">Come back tomorrow for more spins!</p>
          <button onClick={onClose} className="btn-primary">
            Close
          </button>
        </div>
      </GameModal>
    );
  }

  const spin = () => {
    if (spinning) return;

    setSpinning(true);
    const spins = 5 + Math.random() * 5; // 5-10 full rotations
    const extraDegrees = Math.random() * 360;
    const totalRotation = rotation + (360 * spins) + extraDegrees;

    setRotation(totalRotation);

    setTimeout(() => {
      const prizeIndex = Math.floor((extraDegrees / 360) * SPIN_PRIZES.length);
      const wonPrize = SPIN_PRIZES[prizeIndex];
      setPrize(wonPrize);
      setSpinning(false);
      onComplete(wonPrize.value);
    }, 4000);
  };

  return (
    <GameModal onClose={onClose}>
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-6">🎡 Spin the Wheel!</h2>

        {!prize ? (
          <>
            {/* Wheel */}
            <div className="relative w-80 h-80 mx-auto mb-8">
              <motion.div
                animate={{ rotate: rotation }}
                transition={{ duration: 4, ease: "easeOut" }}
                className="w-full h-full rounded-full border-8 border-gray-300 shadow-2xl relative overflow-hidden"
              >
                {SPIN_PRIZES.map((item, i) => {
                  const angle = (360 / SPIN_PRIZES.length) * i;
                  return (
                    <div
                      key={i}
                      className={`absolute w-full h-full bg-gradient-to-br ${item.color}`}
                      style={{
                        transform: `rotate(${angle}deg)`,
                        clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin((Math.PI * 2) / SPIN_PRIZES.length)}% ${50 - 50 * Math.cos((Math.PI * 2) / SPIN_PRIZES.length)}%)`
                      }}
                    >
                      <div
                        className="absolute top-12 left-1/2 -translate-x-1/2 text-white font-bold text-sm"
                        style={{ transform: `rotate(-${angle}deg)` }}
                      >
                        {item.label}
                      </div>
                    </div>
                  );
                })}

                {/* Center Circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-lg border-4 border-yellow-400 flex items-center justify-center text-2xl">
                  ⭐
                </div>
              </motion.div>

              {/* Arrow Pointer */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-16 border-l-transparent border-r-transparent border-t-red-500 z-10" />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={spin}
              disabled={spinning}
              className={`px-8 py-4 rounded-xl font-bold text-lg shadow-lg ${spinning
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                }`}
            >
              {spinning ? 'Spinning...' : '🎯 SPIN NOW!'}
            </motion.button>
          </>
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="py-12"
          >
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 1 }}
              className="text-8xl mb-4"
            >
              {prize.value > 0 ? '🎉' : '😅'}
            </motion.div>
            <h3 className="text-3xl font-bold mb-2">
              {prize.value > 0 ? `You Won ${prize.value} Points!` : 'Try Again Next Time!'}
            </h3>
            <p className="text-gray-600 mb-6">
              {prize.value > 0 ? 'Points added to your account!' : 'Better luck tomorrow!'}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold"
            >
              Awesome! ✓
            </motion.button>
          </motion.div>
        )}
      </div>
    </GameModal>
  );
};

// Scratch Card Game
const ScratchCardGame = ({ onClose, onComplete, playsLeft }) => {
  const [scratched, setScratched] = useState(Array(9).fill(false));
  const [revealed, setRevealed] = useState(false);
  const [prizes] = useState(() => [...SCRATCH_PRIZES].sort(() => Math.random() - 0.5));

  if (playsLeft <= 0) {
    return (
      <GameModal onClose={onClose}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏰</div>
          <h3 className="text-2xl font-bold mb-2">No Plays Left</h3>
          <p className="text-gray-600 mb-4">Come back tomorrow for more cards!</p>
          <button onClick={onClose} className="btn-primary">Close</button>
        </div>
      </GameModal>
    );
  }

  const handleScratch = (index) => {
    if (revealed) return;

    const newScratched = [...scratched];
    newScratched[index] = true;
    setScratched(newScratched);

    if (newScratched.filter(Boolean).length >= 9) {
      setRevealed(true);
      const totalPoints = prizes.reduce((sum, p) => sum + p.points, 0);
      setTimeout(() => onComplete(totalPoints), 1000);
    }
  };

  return (
    <GameModal onClose={onClose}>
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-6">🎫 Scratch Card!</h2>
        <p className="text-gray-600 mb-6">Click all 9 cards to reveal your prizes!</p>

        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
          {prizes.map((prize, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: scratched[i] ? 1 : 1.05 }}
              whileTap={{ scale: scratched[i] ? 1 : 0.95 }}
              onClick={() => handleScratch(i)}
              className={`aspect-square rounded-xl flex items-center justify-center text-4xl cursor-pointer transition-all ${scratched[i]
                  ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-orange-300'
                  : 'bg-gradient-to-br from-gray-400 to-gray-600 text-white text-2xl hover:from-gray-500'
                }`}
            >
              {scratched[i] ? (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="text-center"
                >
                  <div className="text-5xl mb-1">{prize.emoji}</div>
                  {prize.points > 0 && (
                    <div className="text-sm font-bold text-orange-600">+{prize.points}</div>
                  )}
                </motion.div>
              ) : (
                '?'
              )}
            </motion.div>
          ))}
        </div>

        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-2xl font-bold text-green-600 mb-4">
              Total: {prizes.reduce((sum, p) => sum + p.points, 0)} Points! 🎉
            </div>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold"
            >
              Collect Points! ✓
            </button>
          </motion.div>
        )}
      </div>
    </GameModal>
  );
};

// Quiz Game
const QuizGame = ({ onClose, onComplete, playsLeft }) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [finished, setFinished] = useState(false);

  if (playsLeft <= 0) {
    return (
      <GameModal onClose={onClose}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏰</div>
          <h3 className="text-2xl font-bold mb-2">No Plays Left</h3>
          <p className="text-gray-600 mb-4">Come back tomorrow for more quizzes!</p>
          <button onClick={onClose} className="btn-primary">Close</button>
        </div>
      </GameModal>
    );
  }

  const question = QUIZ_QUESTIONS[currentQ];

  const handleAnswer = (index) => {
    if (answered) return;

    setSelectedAnswer(index);
    setAnswered(true);

    if (index === question.correct) {
      setScore(score + question.points);
    }

    setTimeout(() => {
      if (currentQ < QUIZ_QUESTIONS.length - 1) {
        setCurrentQ(currentQ + 1);
        setAnswered(false);
        setSelectedAnswer(null);
      } else {
        setFinished(true);
        const finalScore = index === question.correct ? score + question.points : score;
        onComplete(finalScore);
      }
    }, 1500);
  };

  if (finished) {
    return (
      <GameModal onClose={onClose}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center py-12"
        >
          <div className="text-8xl mb-4">🏆</div>
          <h3 className="text-3xl font-bold mb-2">Quiz Complete!</h3>
          <p className="text-2xl text-green-600 font-bold mb-6">
            You scored {score} points!
          </p>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold"
          >
            Awesome! ✓
          </button>
        </motion.div>
      </GameModal>
    );
  }

  return (
    <GameModal onClose={onClose}>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">🧠 Food Quiz</h2>
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold">
            Score: {score} ⭐
          </div>
        </div>

        <div className="mb-4 flex gap-2">
          {QUIZ_QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${i < currentQ ? 'bg-green-500' : i === currentQ ? 'bg-blue-500' : 'bg-gray-300'
                }`}
            />
          ))}
        </div>

        <h3 className="text-xl font-semibold mb-6">
          Question {currentQ + 1}/{QUIZ_QUESTIONS.length}: {question.question}
        </h3>

        <div className="space-y-3">
          {question.options.map((option, i) => (
            <motion.button
              key={i}
              whileHover={!answered ? { scale: 1.02, x: 5 } : {}}
              whileTap={!answered ? { scale: 0.98 } : {}}
              onClick={() => handleAnswer(i)}
              disabled={answered}
              className={`w-full p-4 rounded-xl font-semibold text-left transition-all ${!answered
                  ? 'bg-gray-100 hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-400'
                  : selectedAnswer === i
                    ? i === question.correct
                      ? 'bg-green-100 border-2 border-green-500'
                      : 'bg-red-100 border-2 border-red-500'
                    : i === question.correct
                      ? 'bg-green-100 border-2 border-green-500'
                      : 'bg-gray-100 border-2 border-gray-200'
                }`}
            >
              {option}
              {answered && i === question.correct && ' ✓'}
              {answered && selectedAnswer === i && i !== question.correct && ' ✗'}
            </motion.button>
          ))}
        </div>
      </div>
    </GameModal>
  );
};

// Game Modal Wrapper
const GameModal = ({ children, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
};

export default MiniGamesTab;