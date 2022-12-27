import Head from 'next/head';
import Layout from '@components/Layout';
import Section from '@components/Section';
import Container from '@components/Container';
import Map from '@components/Map';
import Button from '@components/Button';
import styles from '@styles/Home.module.scss';
import useSWR from 'swr'; //importado (SWR previamente instalado)(A)

const DEFAULT_CENTER = [38.907132, -77.036546]
const fetcher = (url) => fetch(url).then((res) => res.json()); //agregado(B)


export default function Home() {
  //Uso dara de API GOOGLE(C)
  const { data } = useSWR(
    'https://firebasestorage.googleapis.com/v0/b/santa-tracker-firebase.appspot.com/o/route%2Fsanta_en.json?alt=media&2018b',
    fetcher
  );
  // console.log(data); //Visualiza el array con toda la data de lugares donde recorre santa

    const currentDate = new Date(Date.now());
  // const currentDate = new Date('2022-12-25T02:34:30.115Z'); probando si fuera  "x hora" arriva en x "lugar"
  const currentYear = currentDate.getFullYear() //setear año 2019 > actual 2022(E)

  //////Tiempo de los arrivos a destinos corregios(F)
  const destinations = data?.destinations.map((destination) => {
    const { arrival, departure } = destination;
    /*Hora de llegada y hora actual*/
    const arrivalDate = new Date(arrival);
    const departureDate = new Date(departure);

    arrivalDate.setFullYear(currentYear);
    departureDate.setFullYear(currentYear);

    return {
      ...destination,
      arrival: arrivalDate.getTime(),
      departure: departureDate.getTime(),
    }

  });

  return (
    <Layout>
      <Head>
        <title>Next.js Leaflet Starter</title>
        <meta name="description" content="Create mapping apps with Next.js Leaflet Starter" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Section>
        <Container>
          <h1 className={styles.title}>
            Uso de React, Next.js y Leaflet.
          </h1>

          <Map className={styles.homeMap} width="800" height="400" center={[0, 0]} zoom={1}>
            {({ TileLayer, Marker, Popup }, Leaflet) => (
              <>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                />
                {destinations?.map(({ id, arrival, departure, location, city, region }) => {

                  const arrivalDate = new Date(arrival);
                  const arrivalHours = arrivalDate.getHours()
                  const arrivalMinutes = arrivalDate.getMinutes()
                  const arrivalTime = `${arrivalHours}:${arrivalMinutes}`;

                  const departureDate = new Date(departure);
                  const departureHours = departureDate.getHours()
                  const departureMinutes = departureDate.getMinutes()
                  const departureTime = `${departureHours}:${departureMinutes}`;

                  /*constantes que nos sirven p/saber locación de SantaClaus (H)*/
                  const santaWasHere = currentDate.getTime() - departureDate.getTime() > 0;
                  const santaIsHere = currentDate.getTime() - arrivalDate.getTime() > 0 && !santaWasHere;
                  let iconUrl = '/images/tree-marker-icon.png';
                  let iconRetinaUrl = '/images/tree-marker-icon-2x.png';
                  if ( santaWasHere ) {
                    iconUrl = '/images/gift-marker-icon.png';
                    iconRetinaUrl = '/images/gift-marker-icon-2x.png';
                  }

                  if ( santaIsHere ) {
                    iconUrl = '/images/santa-marker-icon.png';
                    iconRetinaUrl = '/images/santa-marker-icon-2x.png';
                  }
                  /*para que se muestre mejor el icon de santaclaus*/
                  let className = '';
                  if ( santaIsHere ) {
                    className = `${className} ${styles.iconSantaIsHere}`;
                  }

                  /*agregamos las imagenes de arbolitos en el marker(G)*/
                  return (
                    <Marker
                      key={id}
                      position={[location.lat, location.lng]}
                      icon={Leaflet.icon({
                        iconUrl,
                        iconRetinaUrl,
                        iconSize: [41, 41],
                        className
                      })}>
                      <Popup>
                        <strong>Location:</strong> {city}, {region}
                        <br />
                        <strong>Arrival:</strong> {arrivalDate.toDateString()} @ {arrivalTime}
                        <br />
                        <strong>Departure:</strong> {arrivalDate.toDateString()} @ {departureTime}
                      </Popup>
                    </Marker>
                  )
                })}
                {/* <Marker position={DEFAULT_CENTER}> //reemplazado por lo de arriba, desde data hasta marker(D)*/}
              </>
            )}
          </Map>

          <p className={styles.description}>
            <code className={styles.code}>yarn create next-app -e https://github.com/colbyfayock/next-leaflet-starter</code>
          </p>

          <p className={styles.view}>
            <Button href="https://github.com/colbyfayock/next-leaflet-starter">Ver en GitHub</Button>
          </p>
        </Container>
      </Section>
    </Layout>
  )
}
