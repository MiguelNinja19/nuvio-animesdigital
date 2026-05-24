// Local Node.js sanity test.
// Run with: node test.js
//
// IMPORTANT: this only proves the *scraping logic* works. Always re-test
// inside the Nuvio Plugin Tester before publishing (Hermes runtime differs).

const { getStreams } = require('./providers/animesdigital.js');

async function test(name, args) {
  console.log("\n=== " + name + " ===");
  try {
    const t0 = Date.now();
    const streams = await getStreams.apply(null, args);
    console.log("⏱️  " + (Date.now() - t0) + "ms | streams: " + streams.length);
    streams.forEach(function (s) {
      console.log("  ✓", s.title.substring(0, 80));
      console.log("    →", s.url.substring(0, 110));
    });
  } catch (e) {
    console.error("  ✗ Erro:", e.message);
  }
}

(async function () {
  // Anime TV
  await test("Demon Slayer S1E1",     ['85937', 'tv', 1, 1]);
  await test("One Piece S1E1",        ['37854', 'tv', 1, 1]);
  await test("Naruto S1E1",           ['46260', 'tv', 1, 1]);
  await test("Attack on Titan S1E1",  ['1429',  'tv', 1, 1]);

  // Anime movie
  await test("Demon Slayer: Mugen Train (movie)", ['635302', 'movie', null, null]);

  // Non-anime — must short-circuit and return []
  await test("Breaking Bad (deve retornar [])", ['1396', 'tv', 1, 1]);

  console.log("\nDone.");
})();
