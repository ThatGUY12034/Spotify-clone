import Layout from "../components/Layout";
import AlbumCard from "../components/AlbumCard";
import SongCard from "../components/SongCard";
import { useSong } from "../context/SongContext";

const Row = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="mb-8">
    <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
    <div className="flex gap-4 overflow-x-auto pb-2">{children}</div>
  </section>
);

const Home = () => {
  const { albums, songs, loading } = useSong();

  return (
    <Layout>
      {loading ? (
        <p className="text-gray-400 py-10">Loading your music...</p>
      ) : (
        <div className="py-4">
          <Row title="Albums">
            {albums.length ? (
              albums.map((a) => <AlbumCard key={a.id} album={a} />)
            ) : (
              <p className="text-gray-500">No albums yet.</p>
            )}
          </Row>

          <Row title="Songs">
            {songs.length ? (
              songs.map((s) => <SongCard key={s.id} song={s} queue={songs} />)
            ) : (
              <p className="text-gray-500">No songs yet.</p>
            )}
          </Row>
        </div>
      )}
    </Layout>
  );
};

export default Home;
