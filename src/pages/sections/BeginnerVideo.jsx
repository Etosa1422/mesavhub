import { Link } from "react-router-dom";

const BeginnerVideo = () => {

    return (

         <div className="mt-20 bg-white shadow-md rounded-lg p-6">
      <div className="md:flex items-start gap-8">
        <div className="flex-1">
          <h5 className="text-lg font-bold text-gray-800">
            BEGINNER'S VIDEO GUIDE ON HOW TO USE{' '}
            <Link to ="/signup" className="underline text-gray-800 font-bold"> Mesavs.com</Link>
          </h5>
        </div>
        <div className="w-full md:w-[480px] h-[270px]">
          <iframe
            src="https://www.youtube.com/embed/ggCXWAJ1gRA?controls=1"
            width="100%"
            height="100%"
            frameBorder="0"
            allow="autoplay; fullscreen"
            className="rounded-lg shadow"
          ></iframe>
        </div>
      </div>
    </div>
    );
};

export default BeginnerVideo