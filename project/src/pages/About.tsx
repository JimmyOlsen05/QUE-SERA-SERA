export default function About() {
  return (
    <div className="pt-16 min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block text-indigo-600 xl:inline">About UniConnect</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Connecting students worldwide for a better university experience.
          </p>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="p-8 bg-white rounded-lg shadow-lg">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Our Mission</h2>
              <p className="text-gray-600">
                UniConnect aims to create a global network of university students, fostering collaboration,
                cultural exchange, and academic success. We believe in the power of connection to enhance
                the university experience for students worldwide.
              </p>
            </div>

            <div className="p-8 bg-white rounded-lg shadow-lg">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Our Vision</h2>
              <p className="text-gray-600">
                We envision a world where every university student has access to a supportive global
                community, making higher education more collaborative, inclusive, and enriching.
              </p>
            </div>

            <div className="p-8 bg-white rounded-lg shadow-lg lg:col-span-2">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Our Values</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-indigo-600">Diversity</h3>
                  <p className="text-gray-600">
                    Celebrating and embracing different cultures, perspectives, and experiences.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-indigo-600">Innovation</h3>
                  <p className="text-gray-600">
                    Continuously improving our platform to meet evolving student needs.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-indigo-600">Community</h3>
                  <p className="text-gray-600">
                    Building meaningful connections and fostering a supportive environment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 