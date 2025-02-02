
import noresult from '../../assets/noresult.png';

const NoResultsFound = () => {
  return (
    <div className="flex justify-center items-center w-full mt-6 h-[200px]">
      <img
        src={noresult}
        alt="No Results Found"
        className="max-w-full h-auto"
      />
    </div>
  );
};

export default NoResultsFound;
