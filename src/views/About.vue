<template>
  <div>
    <!-- Hero Section -->
    <section class="hero min-h-screen bg-cover bg-center flex items-center justify-center">
      <div class="container mx-auto px-4 py-20">
        <div class="grid grid-cols-2 gap-12 max-w-3xl mx-auto">
          <div class="flex flex-col justify-center items-center bg-black/30 p-6 rounded-lg backdrop-blur-sm">
            <p class="text-pink text-3xl md:text-5xl font-extrabold mb-2">IMMERSIVE</p>
            <p class="text-purple text-3xl md:text-5xl font-extrabold">ENGAGING</p>
          </div>
          <div class="flex flex-col justify-center items-center bg-black/30 p-6 rounded-lg backdrop-blur-sm">
            <p class="text-purple text-3xl md:text-5xl font-extrabold mb-2">INNOVATIVE</p>
            <p class="text-pink text-3xl md:text-5xl font-extrabold">EXCITING</p>
          </div>
        </div>
      </div>
    </section>

    <!-- About Content -->
    <section class="py-20">
      <div class="container mx-auto px-6">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-4xl font-bold text-blue mb-12 text-center">ABOUT VR SPACE</h1>
          
          <div class="bg-blue_terms rounded-xl shadow-xl">
            <div class="p-8 md:p-12 text-lg leading-relaxed space-y-6">
              <p class="font-medium">
                VR SPACE is a premier entertainment venue specializing in providing immersive virtual reality
                experiences through new technologies. We offer a diverse array of VR activities that cater to a
                wide demographic, with a particular focus on creating a family-friendly environment that appeals
                to both children and their parents.
              </p>

              <h2 class="text-2xl font-bold text-blue mt-6">Our VR Platforms</h2>
              
              <div class="space-y-6">
                <div class="bg-white/10 p-6 rounded-lg">
                  <h3 class="text-xl font-bold mb-2">1. HTC Vive</h3>
                  <p>
                    Delivers a fully immersive gaming experience with a variety of interactive games
                    suitable for all ages. Users engage in activities ranging from combat to leisure, where their
                    real-world movements are mirrored in the virtual environment.
                  </p>
                </div>
                
                <div class="bg-white/10 p-6 rounded-lg">
                  <h3 class="text-xl font-bold mb-2">2. EggVR</h3>
                  <p>
                    Offers a thrilling virtual reality rollercoaster experience. It provides a range of
                    simulations from adventurous rides to horror and leisurely experiences, making it a versatile
                    choice for both young and adult audiences.
                  </p>
                </div>
                
                <div class="bg-white/10 p-6 rounded-lg">
                  <h3 class="text-xl font-bold mb-2">3. GT Racing Simulator</h3>
                  <p>
                    Offers driving simulations that cater to all skill levels. Clients can
                    experience the excitement of driving high-performance cars and enjoy the thrill of speed using
                    this racing simulator.
                  </p>
                </div>
                
                <div class="bg-white/10 p-6 rounded-lg">
                  <h3 class="text-xl font-bold mb-2">Coming Soon!</h3>
                  <ul class="list-disc pl-6 space-y-2">
                    <li>Magic UFO VR</li>
                    <li>Racing Kart VR</li>
                    <li>Aircraft VR</li>
                  </ul>
                </div>
              </div>
              
              <div class="bg-purple/20 p-6 rounded-lg mt-8">
                <p class="font-medium">
                  VR SPACE prioritizes safety, enjoyment, and educational value, making it an ideal destination for
                  family outings. By combining technology with a broad selection of VR experiences, we create an
                  engaging and dynamic environment where clients can enjoy new and exciting ways to play and
                  learn together. Since our inception in February 2023, we have been dedicated to enhancing the
                  entertainment landscape with innovative and memorable VR experiences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// Component name definition
defineOptions({
  name: 'AboutPage'
});
</script>

<style scoped>
.hero {
  background-image: url('@/assets/images/about_us/about_us.png');
  background-position: center;
  background-size: cover;
}
</style>