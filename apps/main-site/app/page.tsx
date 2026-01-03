import { Button } from "@repo/ui";
import { MainSiteHeader } from "./components/MainSiteHeader";

export default function Page() {
    return (
        <>
            <MainSiteHeader />
            <main>
                <h1>Situs Utama</h1>
                <p>Ini adalah halaman publik perusahaan.</p>
                <Button>Hubungi Kami</Button>
            </main>
        </>
    );
}
