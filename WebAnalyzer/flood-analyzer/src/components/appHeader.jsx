import "./appheader.css";

export const AppHeader = () => {
    return <div className="appHeader">
        <div className="titleLine topLine">
            <img src="/flood-svgrepo-com.svg"  className="appIcon"/>
            <span className="mainTitle">List of 5,521 Completed Flood Control Projects</span>
            <span className="subtitle">Completed from July 2022 to May 2024</span>
            <span className="subtitle">|</span>
            <span className="subtitle">Data as of May 31, 2024</span>
        </div>
        <div className="titleLine nextLine">
            <div className="subtitle">Source: </div>
            <div className="subtitle">DPWH</div>
            <div className="subtitle">|</div>
            <div className="subtitle">FOI</div>
            <div className="subtitle">|</div>
            <div className="subtitle">🌹Joie De Vivre</div>
        </div>
    </div>
}