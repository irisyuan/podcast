export default function Header() {
  return (
    <div className="flex flex-col md:flex-row gap-8 items-start w-full text-center pt-4">
      <div className="flex-1 mt-12 md:mt-24">
        <h1 className="text-4xl font-bold header-text">Track and share your favorite podcasts with your friends</h1>
        <p className="text-xl lg:text-2xl !leading-tight mx-auto max-w-xl text-center">
        GoodPod is the only friends-only podcast list tracker. See what your friends are listening to and discover new podcast episodes!
        </p>
      </div>
      <img src="/landing-pods.png" alt="Podcast collage" className="w-1/2 h-auto object-cover mx-auto md:mx-0" />
    </div>
  );
}
