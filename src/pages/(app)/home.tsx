import {Link,Navigate} from 'react-router-dom'
import {useAuthStatus} from 'deepspace'
import '../../scope/review.css'
export default function HomePage(){const {isSignedIn}=useAuthStatus();if(isSignedIn)return <Navigate to="/blind" replace/>;return <section className="review-page review-home">
 <header><p className="review-kicker">Your review workspace</p><h1>Make the next AI decision count.</h1><p>ReviewReceipt helps teams compare outputs against shared criteria, preserve independent judgments, and turn the result into a usable handoff.</p></header>
 <div className="review-home-grid">
 <article className="review-card"><p className="review-kicker">01 · Shared and persistent</p><h2>Open review workspace</h2><p>Invite two registered reviewers, freeze the task and collect sealed votes across devices.</p><Link className="review-primary" to="/blind">Open workspace →</Link></article>
 <article className="review-card"><p className="review-kicker">02 · No account needed</p><h2>Compare your own answers</h2><p>Use any non-sensitive candidate responses and download a local review record without signing in.</p><Link className="review-secondary" to="/?mode=own#compare">Start a local comparison →</Link></article>
 <article className="review-card"><p className="review-kicker">03 · Learn in one minute</p><h2>Try the sample</h2><p>See how opposite labels map back to the same candidate and why agreement is not verified accuracy.</p><Link className="review-secondary" to="/#compare">Try the sample →</Link></article>
 </div><footer className="review-footer"><Link to="/scopecheck">ScopeCheck archive</Link><a href="https://github.com/1235357/reviewreceipt-deepspace">Source and verification</a></footer></section>}
