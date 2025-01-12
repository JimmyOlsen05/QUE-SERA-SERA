import { Users, MessageSquare, BookOpen, Globe2, Calendar, Video, Lock, Share2 } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Connect with Peers",
      description: "Find and connect with students from your university and courses. Build your academic network and make lasting friendships."
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Real-time Chat",
      description: "Instant messaging with fellow students. Create group chats for projects and study groups."
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Study Groups",
      description: "Form or join study groups for better collaboration. Share resources and learn together."
    },
    {
      icon: <Globe2 className="w-6 h-6" />,
      title: "Global Network",
      description: "Connect with international students. Share cultural experiences and broaden your perspective."
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Event Planning",
      description: "Organize and discover campus events. Never miss important academic and social gatherings."
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: "Virtual Meetups",
      description: "Host or join virtual study sessions. Distance learning made interactive and engaging."
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Secure Platform",
      description: "Your data is protected. Enjoy a safe and private academic social network."
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: "Resource Sharing",
      description: "Share study materials and resources. Collaborate on documents in real-time."
    }
  ];

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block text-indigo-600 xl:inline">Features</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Discover all the tools and features that make UniConnect the perfect platform for your university journey.
          </p>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="relative p-6 bg-white rounded-lg shadow-lg transition-all duration-300 transform group hover:-translate-y-1"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg opacity-25 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200" />
                <div className="flex relative flex-col items-center text-center">
                  <div className="flex justify-center items-center mb-4 w-12 h-12 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-md">
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-gray-900">{feature.title}</h3>
                  <p className="text-gray-500">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 