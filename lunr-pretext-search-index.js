var ptx_lunr_search_style = "textbook";
var ptx_lunr_docs = [
{
  "id": "front-colophon",
  "level": "1",
  "url": "front-colophon.html",
  "type": "Colophon",
  "number": "",
  "title": "Colophon",
  "body": "  "
},
{
  "id": "sec-fem-mc-intro",
  "level": "1",
  "url": "sec-fem-mc-intro.html",
  "type": "Section",
  "number": "1.1",
  "title": "Introduction",
  "body": " Introduction    Radiation transport models originate in the linear Boltzmann equation, a high-dimensional integro-differential equation whose solution describes the distribution of particles as they stream, scatter, and are absorbed through a medium. Obtaining numerical solutions to such models is made challenging not only due to high dimensionality: collision operators take the form of nonlocal integrals, requiring knowledge of the solution across the entire spatial domain. If one were to apply a typical finite element method (FEM) regime directly, these nested integrals would yield a dense coupling between degrees of freedom, dominating the computational cost~\\cite{craus2020accelerating} [n] .  To handle this nonlocality, classical deterministic approaches make limiting approximations. In shielding applications, buildup factors and low-order discrete-ordinates ( ) quadratures are used, but both degrade for complex geometries and highly anisotropic scattering [n] . Diffusion synthetic acceleration (DSA), which uses a low-order diffusion correction to accelerate the source iteration (Richardson) scheme for the equations, is effective in the diffusive regime but is known to lose stability for problems with strong reflective boundaries or high scattering ratios [n] .  Purely Monte Carlo approaches handle arbitrarily complex geometries and scattering operators without such approximations, but their slow convergence rate attributes a steep computational cost for naive implementations. Variance reduction techniques, through importance sampling or weight windows, are therefore essential. The Consistent Adjoint Driven Importance Sampling (CADIS) method and its forward-weighted extension FW-CADIS use adjoint flux solutions - computed by a deterministic solver - to generate importance maps and weight windows automatically, achieving speedups of two to four orders of magnitude over unbiased MC in typical shielding configurations [n] . Both methods are implemented in the production shielding codes MAVRIC and ADVANTG~\\cite{peplow2011monte} [n] .  Hybrid deterministic-stochastic schemes aim to exploit the complementary strengths of both frameworks: the flexibility and unbiasedness of Monte Carlo and the efficiency of FEM. In shielding and gamma-ray detector modelling, several such frameworks have been proposed, including sparse Monte Carlo methods~\\cite{kaliuzhnyi2022sparse}, hybrid discontinuous Galerkin discretisations~\\cite{krotz2024hybrid}, and the use of deterministic adjoint solutions to guide importance sampling~\\cite{wagner2010forward,wagner2010review}. However, a rigorous numerical analysis of schemes that couple a stabilised finite element discretisation of the spatial transport operator with a Monte Carlo approximation of the scattering integral appears to be absent from the literature.  The work presented in this report is motivated by that gap. We analyse a source-iteration scheme for a stationary linear transport equation with nonlocal scattering, in which the spatial operator is discretised by a Streamline Upwind Petrov-Galerkin (SUPG) finite element method and the scattering integral is approximated by a Monte Carlo estimator at each iteration.  The report is organised as follows. introduces the strong form of the model problem and states assumptions on the data. provides a brief background on finite element methods, SUPG stabilisation, and Monte Carlo integration. presents the SUPG variational formulation of the transport equation, introduces the source iteration scheme, and outlines the structure of the error analysis via the triangle inequality. develops the deterministic analysis - establishing coercivity and continuity of the bilinear forms, a C\\'{e}a-type best-approximation estimate for the discretisation error, and proves a contraction rate for source iteration under a subcriticality condition on the scattering operator. extends this analysis to the stochastic setting, deriving a Strang-type error estimate in which the Monte Carlo consistency error is bounded probabilistically via Hoeffding's inequality. The resulting estimate makes explicit the interplay between mesh size , sample size , and iteration count . verifies the predicted convergence rates using a manufactured solution on the unit square, and concludes with a discussion of limitations and directions for further work.  "
},
{
  "id": "sec-fem-mc-model",
  "level": "1",
  "url": "sec-fem-mc-model.html",
  "type": "Section",
  "number": "1.2",
  "title": "Model Formulation",
  "body": " Model Formulation    We consider the stationary linear transport equation subject to inflow boundary condition   Here is a bounded Lipschitz domain with outward unit normal . The data are as follows.    is a constant wind field.     , , is the absorption cross section.     , , is the scattering cross section.     , , is the scattering kernel, normalised so that      is an interior source and is the inflow datum.     The combined absorption and scattering cross sections form the total (extinction) cross section~\\cite{ROUSSIN2003581} which appears throughout the analysis. We assume the positivity condition   Equation generalises classical diffusion by replacing the local Fick's-law closure with an explicit nonlocal scattering term. Rather than approximating the effect of collisions by a gradient of , the integral accounts for particles arriving at from a neighbourhood weighted by the probability density . The subtracted term accounts for particles lost from due to scattering, so that the net scattering contribution vanishes when is spatially uniform and is normalised as in .  This nonlocal structure is physically significant under three modelling regimes pertinent to shielding applications, which are in direct contradiction of the diffusion approximation~\\cite{dematte2026diffusion}. One instance is where absorption is not negligible relative to scattering, meaning the diffusion approximation breaks down. Second, where the mean free path is comparable to the domain length scale, so that particles travel non-negligible distances between collisions. Third, where microstructure induces long-range spatial correlations in the collision probability, as in heterogeneous or stochastic media.  The choice of kernel determines the character of the nonlocal interaction. Gaussian kernels model short-range scattering with an exponentially decaying influence. Algebraically decaying kernels , arise from the fractional Laplacian and capture superdiffusive or long-tailed transport. A final trivial choice in the case of is the constant unit kernel , deflating the scattering operator to simply integrating . Although this operation is still nonlocal, it makes for a straightforward test case in validating our analytical results.  "
},
{
  "id": "sec-fem-mc-prelim",
  "level": "1",
  "url": "sec-fem-mc-prelim.html",
  "type": "Section",
  "number": "1.3",
  "title": "Preliminaries",
  "body": " Preliminaries     Finite Element Methods  The finite element method (FEM) seeks an approximate weak solution to a PDE by selecting from finite-dimensional subspace of a suitable Hilbert space \\cite{pryer2022fem}. For the model Poisson problem on with , this gives: find such that The Lax-Milgram theorem guarantees a unique solution whenever is coercive and continuous on , and is a bounded linear functional. Restricting to a conforming finite element space and choosing a basis yields the linear system with . The coercivity and continuity of results in an positive-definite and bounded. The C\\'{e}a lemma provides the best-approximation estimate where and are the coercivity and continuity constants of respectively.    SUPG Stabilisation  For advection-dominated problems, the standard Galerkin formulation becomes unstable. The bilinear form associated with the operator is not necessarily coercive in , and the Galerkin solution may exhibit spurious oscillations~\\cite{ern2004theory}. The Streamline Upwind Petrov-Galerkin (SUPG) method~\\cite{brooks1982streamline, johnson1983finite} addresses this by modifying the test function to on each element , where is a mesh-dependent stabilisation parameter.  The effect of SUPG is to add an artificial diffusion of strength along streamlines of the solution. Consistency is preserved - as the additional term vanishes when evaluating the exact solution - while coercivity is ensured for a sufficient strength .    Monte Carlo Integration  Monte Carlo integration estimates an integral by the sample mean The estimator is unbiased with , and its standard deviation satisfies where ~\\cite{gobet2016monte}. Notably, this rate is independent of dimension, making Monte Carlo the method of choice for high-dimensional integration.    Useful Identities  Finally, the following identities are used repeatedly in the analysis and stated here for convenience. The first is the Green's formula for the advection operator. Given and , we have For much of our analysis, is taken to be a constant advection direction, thus the final term vanishes.  In addition, Young's inequality states that, for any we have    "
},
{
  "id": "sec-fem-mc-variation",
  "level": "1",
  "url": "sec-fem-mc-variation.html",
  "type": "Section",
  "number": "1.4",
  "title": "Outline of Analysis",
  "body": " Outline of Analysis   Introduction  In this section, we present a framework for solving through a hybrid deterministic-stochastic method. We derive the SUPG variational formulation, and provide an outline on the analytical contribution of this report: deriving an error estimate in terms of mesh size , fixed-point iteration and Monte Carlo sampling size .    Reformulation of the Strong Form  It is convenient to rewrite by collecting the reaction terms on the left-hand side. Absorbing into the LHS with total cross section , equation becomes where is the total cross section and the scattering operator is given by     SUPG Variational Form  We define to be be a conforming, shape-regular triangulation of . That is, is a finite set of sub-domains with the following properties: \\begin{enumerate} \\item implies is an open simplex or box. \\item For any we have that is a full lower-dimensional simplex (i.e., it is either , a vertex, an edge, or the whole of and ) of both and . \\item . \\end{enumerate} Let be a conforming finite element space. In the SUPG framework, we employ a modified test function given by where is an element-specific stabilisation parameter and . We will further assume that   To put into SUPG variational form, we multiply by each side by the modified test function, integrate over the domain and subtract a boundary inflow term. The RHS becomes the bilinear form We apply the same treatment to the LHS of while keeping the terms distinct. The first term becomes the bilinear scattering form and the source term takes on the boundary inflow term, resulting in the linear form We note that the boundary integral terms (boundary inflow term in and final integral in are not present in the standard SUPG formulation~\\cite{johnson1983finite}. They are added to account for the non-homogeneous inflow boundary condition. For an exact solution of , these terms cancel out.  This brings us to the SUPG variational problem: find such that   However, implementing this problem in a finite element scheme is impractical. The scattering operator is nonlocal, requiring to be evaluated over the whole domain. As opposed to the sparse linear system seen in the previous section, we are left with a full matrix to invert.  We adopt source iteration to work around this. Given an initial estimate , we compute for all  Upon each iteration, the scattering term is treated as a known source evaluated at the previous iterate . Evaluating this source requires computing the integral , which we do via Monte Carlo. Although deterministic quadrature can compute the integral far more accurately and efficiently in the setting of this report (indeed, our later analytical results hold for any positively-weighted quadrature), we focus on Monte Carlo as a precursor to working in higher dimensions and more complex geometries.  This leaves us with the following objective: find appropriate design choices of , and Monte Carlo sampling size so we balance the error attributed to each component of the algorithm.    Outline of Analysis  We analyse with the following objective: find appropriate design choices of , and Monte Carlo sampling size in order to appropriately balance the error attributed to each component of the algorithm.  The framework of our error analysis is based on the triangle inequality. Under the SUPG norm (defined in the next section), we split the error into two components Here, denotes the solution of the fully coupled discrete problem , which is never computed in practice but serves as an analytical reference point. The first term measures how well the finite element space approximates the true solution of , and is controlled by the mesh size and the regularity of via the C\\'{e}a-type estimate derived in . The second term measures how far the source iteration has progressed towards after steps, and is controlled by the contraction rate of the iteration established in . When the scattering integral is replaced by a Monte Carlo estimator, a third source of error enters through the consistency term in the Strang estimate of , governed by the sample size .  The analysis is developed in two stages. In , we work under the assumption of exact evaluation of the scattering integral and derive a bound for in terms of mesh size and fixed-point iterate . This proves convergence of as and , with rates parametised by scattering\/absorption properties ( and ), choice of kernel and the regularity of the true solution .  In , we extend this analysis to the fully discrete scheme in which the scattering integral is approximated by the Monte Carlo estimator . Replacing the exact operator by its empirical approximation introduces a consistency error, which we bound probabilistically using Hoeffding's inequality. The resulting estimate bounds with probability at least for any prescribed , with an additional term of order that vanishes as the sample size grows. The full estimate makes explicit the interplay between and , and provides practical guidance on how to balance these parameters for a given accuracy and confidence level.   "
},
{
  "id": "sec-fem-mc-det",
  "level": "1",
  "url": "sec-fem-mc-det.html",
  "type": "Section",
  "number": "1.5",
  "title": "Deterministic Analysis",
  "body": " Deterministic Analysis   Introduction  In this section, we present a preliminary error analysis under the simplifying assumption that is computed exactly. We define the norms used throughout, before establishing well-posedness through verifying the conditions for the Lax-Milgram theorem. We then derive separate bounds for the discretisation error and the iteration error , which combine via the triangle inequality to give the main deterministic estimate. For simplicity, we take (meaning ) from this section onwards - an extension to nonhomogenous inflow data is left to future work.    Norms  We equip with the SUPG norm, defined as where is the positivity constant defined in and is the element-wise stabilisation parameter. This immediately results in the following relation of norms, used frequently in later analysis For continuity estimates, we also require the stronger star-SUPG norm, given by     Well-Posedness and Key Properties  We now present key properties of the bilinear and linear forms defined in , and . This will show that the variational problem is well-posed, and provide the necessary results for error analysis.   Consistency of the SUPG Method   Let be the true solution of . Then for all we have      We have     Coercivity of   For all we have     We treat each term in separately. For the convection term, by Green's formula we have We combine this with the boundary inflow term. Let . We have where the last equality follows from definition of in . Combined with the reaction term, we have Now, we turn to the SUPG term. We have The second term is indefinite, and we bound its contribution with Young's inequality  Thus, the SUPG Term is bounded below by By , we have . Thus, Adding and , we have    Continuity of   For all we have that where .    We bound every term of in the form of . Beginning with the convection term, we apply Green's formula We bound the first term in as The second term in is bounded as Thus, the convection term is bounded as The reaction term is bounded by The inflow boundary term is bounded by For the SUPG term, we have We bound the first RHS term of as we bound the second term in as Adding together , , , and , we have    Boundedness of   For all we have that     By Cauchy-Schwarz, we have Thus, by definition of ,    Continuity of   For all we have that and thus (by relation of norms), where     We have Using , we take    Coercivity of   Suppose Then the bilinear form is coercive. That is, there exists an such that for all      By and , we have By the assumption , we have Therefore, taking ,    Continuity of   For all , we have that where .    By and , we have    Well-posedness   Let with an extension such that . Then the variational problem of finding such that on and has a unique solution.    Define . We seek where By and , we have that is coercive and bounded. Moreover, is controlled by the SUPG-norm, with each term bounded since and . Therefore, the Lax-Milgram theorem applies to give a unique solving , hence a unique solving .    Finite Element Error  We consider the first term in the triangle inequality in . That is, we find an error estimate and convergence rate for the theoretical finite element solution of .   C\\'{e}a-type best-approximation estimate   Let be a solution of with and let be a solution of . Then we have the following best approximation result:     Let be arbitrary, we split the error as Applying coercivity to ( ), we have We insert the exact solution into the first slot, where the last equality is due to Galerkin orthogonality. By continuity ( ), we have Thus, Applying the triangle inequality to , Taking the infimum over , we have the result     Rates of Convergence   Let denote the piecewise polynomial degree of elements of . Suppose the exact solution of is such that is sufficiently large for to belong to the domain of the Lagrange interpolation operator. Then, there exists a constant such that     The proof follows that of~\\cite{ashby2025nodally}, Corollary 3.5; we provide a brief overview. Denote by the piecewise polynomial Lagrange interpolant of onto the finite element space . Taking in , we have Each of these terms are bounded using standard interpolation estimates~\\cite{ern2021finite}, which apply to norms over and . The third term is first bounded by a trace estimate (see e.g.~\\cite{evans2022partial}, Section 5.5) in terms of these norms. The following estimates combine to give :    where and are constants for trace and interpolation estimates, respectively.    Fixed Point Error  Now, we turn to the second error term in the triangle inequality . That is, we now derive a convergence rate for . In doing so, we also find a rate in the -norm.   Contraction in mixed norms   Let be the solution of the stationary finite element problem . Take and denote by the sequence of solutions to the iterative problem . We have that, for all      Let By coercivity of ( ), Thus,    Convergence in -norm   Let be the solution of the stationary finite element problem . Take and denote by the sequence of solutions to the iterative problem . We have that, for all      By the relation of norms , we have Applying gives Iterating yields the desired convergence result.   Convergence in SUPG-norm   Let be the solution of the stationary finite element problem . Take and denote by the sequence of solutions to the iterative problem . We have that, for all      The result follows from combining and .    Combined Error Estimate  We can now populate the triangle inequality for iterative solution error originally proposed in .   Error Estimate in the Deterministic Setting   Let be the solution of and suppose is the solution of the stationary finite element problem . Take and denote by the sequence of solutions to the iterative problem . We have that, for all      By the triangle inequality, and the result follows from applying and .    Discussion  The analysis above identifies two key constraints on the parameters of the problem.  First, the combined coercivity result for ( ) and the contraction rate for source iteration ( and ) both rely on the single constraint This is a subcriticality condition on the scattering operator: it requires the scattering cross section , kernel mass , and stabilisation parameter to be small relative to the positivity constant . Physically, this refers to absorption effects sufficiently dominating over scattering.  Second, the coercivity proof for ( ) requires which prevents the indefinite SUPG cross term from overwhelming the streamline diffusion contribution. The standard SUPG scaling used in our numerical experiments satisfies for sufficiently fine meshes, namely .   "
},
{
  "id": "lem-well-posed",
  "level": "2",
  "url": "sec-fem-mc-det.html#lem-well-posed",
  "type": "Lemma",
  "number": "1.5.1",
  "title": "Consistency of the SUPG Method.",
  "body": " Consistency of the SUPG Method   Let be the true solution of . Then for all we have    "
},
{
  "id": "sec-fem-mc-det-4-4",
  "level": "2",
  "url": "sec-fem-mc-det.html#sec-fem-mc-det-4-4",
  "type": "Proof",
  "number": "1.5.3.1",
  "title": "",
  "body": " We have   "
},
{
  "id": "lem-a-coer",
  "level": "2",
  "url": "sec-fem-mc-det.html#lem-a-coer",
  "type": "Lemma",
  "number": "1.5.2",
  "title": "Coercivity of <span class=\"process-math\">\\(a(\\cdot,\\cdot)\\)<\/span>.",
  "body": " Coercivity of   For all we have    "
},
{
  "id": "sec-fem-mc-det-4-6",
  "level": "2",
  "url": "sec-fem-mc-det.html#sec-fem-mc-det-4-6",
  "type": "Proof",
  "number": "1.5.3.2",
  "title": "",
  "body": "We treat each term in separately. For the convection term, by Green's formula we have We combine this with the boundary inflow term. Let . We have where the last equality follows from definition of in . Combined with the reaction term, we have Now, we turn to the SUPG term. We have The second term is indefinite, and we bound its contribution with Young's inequality  Thus, the SUPG Term is bounded below by By , we have . Thus, Adding and , we have  "
},
{
  "id": "lem-a-cont",
  "level": "2",
  "url": "sec-fem-mc-det.html#lem-a-cont",
  "type": "Lemma",
  "number": "1.5.3",
  "title": "Continuity of <span class=\"process-math\">\\(a(\\cdot,\\cdot)\\)<\/span>.",
  "body": " Continuity of   For all we have that where .   "
},
{
  "id": "sec-fem-mc-det-4-8",
  "level": "2",
  "url": "sec-fem-mc-det.html#sec-fem-mc-det-4-8",
  "type": "Proof",
  "number": "1.5.3.3",
  "title": "",
  "body": "We bound every term of in the form of . Beginning with the convection term, we apply Green's formula We bound the first term in as The second term in is bounded as Thus, the convection term is bounded as The reaction term is bounded by The inflow boundary term is bounded by For the SUPG term, we have We bound the first RHS term of as we bound the second term in as Adding together , , , and , we have  "
},
{
  "id": "lem-bound-big-s",
  "level": "2",
  "url": "sec-fem-mc-det.html#lem-bound-big-s",
  "type": "Lemma",
  "number": "1.5.4",
  "title": "Boundedness of <span class=\"process-math\">\\(\\mathcal{S}\\)<\/span>.",
  "body": " Boundedness of   For all we have that    "
},
{
  "id": "sec-fem-mc-det-4-10",
  "level": "2",
  "url": "sec-fem-mc-det.html#sec-fem-mc-det-4-10",
  "type": "Proof",
  "number": "1.5.3.4",
  "title": "",
  "body": "By Cauchy-Schwarz, we have Thus, by definition of ,  "
},
{
  "id": "lem-s-cont",
  "level": "2",
  "url": "sec-fem-mc-det.html#lem-s-cont",
  "type": "Lemma",
  "number": "1.5.5",
  "title": "Continuity of <span class=\"process-math\">\\(s(\\cdot,\\cdot)\\)<\/span>.",
  "body": " Continuity of   For all we have that and thus (by relation of norms), where    "
},
{
  "id": "sec-fem-mc-det-4-12",
  "level": "2",
  "url": "sec-fem-mc-det.html#sec-fem-mc-det-4-12",
  "type": "Proof",
  "number": "1.5.3.5",
  "title": "",
  "body": "We have Using , we take  "
},
{
  "id": "cor-a-s-coer",
  "level": "2",
  "url": "sec-fem-mc-det.html#cor-a-s-coer",
  "type": "Corollary",
  "number": "1.5.6",
  "title": "Coercivity of <span class=\"process-math\">\\(a-s\\)<\/span>.",
  "body": " Coercivity of   Suppose Then the bilinear form is coercive. That is, there exists an such that for all     "
},
{
  "id": "sec-fem-mc-det-4-14",
  "level": "2",
  "url": "sec-fem-mc-det.html#sec-fem-mc-det-4-14",
  "type": "Proof",
  "number": "1.5.3.6",
  "title": "",
  "body": "By and , we have By the assumption , we have Therefore, taking ,  "
},
{
  "id": "cor-a-s-cont",
  "level": "2",
  "url": "sec-fem-mc-det.html#cor-a-s-cont",
  "type": "Corollary",
  "number": "1.5.7",
  "title": "Continuity of <span class=\"process-math\">\\(a-s\\)<\/span>.",
  "body": " Continuity of   For all , we have that where .   "
},
{
  "id": "sec-fem-mc-det-4-16",
  "level": "2",
  "url": "sec-fem-mc-det.html#sec-fem-mc-det-4-16",
  "type": "Proof",
  "number": "1.5.3.7",
  "title": "",
  "body": "By and , we have  "
},
{
  "id": "thm-well-posed",
  "level": "2",
  "url": "sec-fem-mc-det.html#thm-well-posed",
  "type": "Theorem",
  "number": "1.5.8",
  "title": "Well-posedness.",
  "body": " Well-posedness   Let with an extension such that . Then the variational problem of finding such that on and has a unique solution.   "
},
{
  "id": "sec-fem-mc-det-4-18",
  "level": "2",
  "url": "sec-fem-mc-det.html#sec-fem-mc-det-4-18",
  "type": "Proof",
  "number": "1.5.3.8",
  "title": "",
  "body": "Define . We seek where By and , we have that is coercive and bounded. Moreover, is controlled by the SUPG-norm, with each term bounded since and . Therefore, the Lax-Milgram theorem applies to give a unique solving , hence a unique solving . "
},
{
  "id": "thm-best-approx",
  "level": "2",
  "url": "sec-fem-mc-det.html#thm-best-approx",
  "type": "Theorem",
  "number": "1.5.9",
  "title": "C\\’{e}a-type best-approximation estimate.",
  "body": " C\\'{e}a-type best-approximation estimate   Let be a solution of with and let be a solution of . Then we have the following best approximation result:    "
},
{
  "id": "sec-fem-mc-fe-det-4",
  "level": "2",
  "url": "sec-fem-mc-det.html#sec-fem-mc-fe-det-4",
  "type": "Proof",
  "number": "1.5.4.1",
  "title": "",
  "body": "Let be arbitrary, we split the error as Applying coercivity to ( ), we have We insert the exact solution into the first slot, where the last equality is due to Galerkin orthogonality. By continuity ( ), we have Thus, Applying the triangle inequality to , Taking the infimum over , we have the result  "
},
{
  "id": "cor-fe-conv-rate",
  "level": "2",
  "url": "sec-fem-mc-det.html#cor-fe-conv-rate",
  "type": "Corollary",
  "number": "1.5.10",
  "title": "Rates of Convergence.",
  "body": " Rates of Convergence   Let denote the piecewise polynomial degree of elements of . Suppose the exact solution of is such that is sufficiently large for to belong to the domain of the Lagrange interpolation operator. Then, there exists a constant such that    "
},
{
  "id": "sec-fem-mc-fe-det-6",
  "level": "2",
  "url": "sec-fem-mc-det.html#sec-fem-mc-fe-det-6",
  "type": "Proof",
  "number": "1.5.4.2",
  "title": "",
  "body": "The proof follows that of~\\cite{ashby2025nodally}, Corollary 3.5; we provide a brief overview. Denote by the piecewise polynomial Lagrange interpolant of onto the finite element space . Taking in , we have Each of these terms are bounded using standard interpolation estimates~\\cite{ern2021finite}, which apply to norms over and . The third term is first bounded by a trace estimate (see e.g.~\\cite{evans2022partial}, Section 5.5) in terms of these norms. The following estimates combine to give :    where and are constants for trace and interpolation estimates, respectively. "
},
{
  "id": "lem-cont-mix",
  "level": "2",
  "url": "sec-fem-mc-det.html#lem-cont-mix",
  "type": "Lemma",
  "number": "1.5.11",
  "title": "Contraction in mixed norms.",
  "body": " Contraction in mixed norms   Let be the solution of the stationary finite element problem . Take and denote by the sequence of solutions to the iterative problem . We have that, for all     "
},
{
  "id": "sec-fem-mc-iter-det-4",
  "level": "2",
  "url": "sec-fem-mc-det.html#sec-fem-mc-iter-det-4",
  "type": "Proof",
  "number": "1.5.5.1",
  "title": "",
  "body": "Let By coercivity of ( ), Thus,  "
},
{
  "id": "thm-conv-l2",
  "level": "2",
  "url": "sec-fem-mc-det.html#thm-conv-l2",
  "type": "Theorem",
  "number": "1.5.12",
  "title": "Convergence in <span class=\"process-math\">\\(L^2(\\Omega)\\)<\/span>-norm.",
  "body": " Convergence in -norm   Let be the solution of the stationary finite element problem . Take and denote by the sequence of solutions to the iterative problem . We have that, for all     "
},
{
  "id": "sec-fem-mc-iter-det-6",
  "level": "2",
  "url": "sec-fem-mc-det.html#sec-fem-mc-iter-det-6",
  "type": "Proof",
  "number": "1.5.5.2",
  "title": "",
  "body": "By the relation of norms , we have Applying gives Iterating yields the desired convergence result. "
},
{
  "id": "cor-conv-supg",
  "level": "2",
  "url": "sec-fem-mc-det.html#cor-conv-supg",
  "type": "Corollary",
  "number": "1.5.13",
  "title": "Convergence in SUPG-norm.",
  "body": " Convergence in SUPG-norm   Let be the solution of the stationary finite element problem . Take and denote by the sequence of solutions to the iterative problem . We have that, for all     "
},
{
  "id": "sec-fem-mc-iter-det-8",
  "level": "2",
  "url": "sec-fem-mc-det.html#sec-fem-mc-iter-det-8",
  "type": "Proof",
  "number": "1.5.5.3",
  "title": "",
  "body": "The result follows from combining and . "
},
{
  "id": "thm-det",
  "level": "2",
  "url": "sec-fem-mc-det.html#thm-det",
  "type": "Theorem",
  "number": "1.5.14",
  "title": "Error Estimate in the Deterministic Setting.",
  "body": " Error Estimate in the Deterministic Setting   Let be the solution of and suppose is the solution of the stationary finite element problem . Take and denote by the sequence of solutions to the iterative problem . We have that, for all     "
},
{
  "id": "sec-fem-mc-combined-det-4",
  "level": "2",
  "url": "sec-fem-mc-det.html#sec-fem-mc-combined-det-4",
  "type": "Proof",
  "number": "1.5.6.1",
  "title": "",
  "body": "By the triangle inequality, and the result follows from applying and . "
},
{
  "id": "sec-fem-mc-sto",
  "level": "1",
  "url": "sec-fem-mc-sto.html",
  "type": "Section",
  "number": "1.6",
  "title": "Stochastic Analysis",
  "body": " Stochastic Analysis     Introduction  Now we consider the case of inexact computation of the scattering form, , through Monte-Carlo integration.   That is, we approximate the nonlocal term of as where are random samples from .  This leads us to a modified iterative finite element problem to be solved in practice. Given an initial estimate , we compute for all  where where for random draws from .  To account for this in our analysis, we similarly modify the theoretical steady-state finite element problem. Placing in , we seek to find such that     FE Steady State Error  We must modify the analysis for our previous Best Approximation result ( ) in light of and satisfying different variational formulations. Indeed, the true solution still solves the variational form while is now treated as the solution to as the steady state of .   Strang-Type Error Estimate   Let be the solution of and the solution of . Then,   Let be arbitrary. We define . By and by definition of , we have that Splitting the first argument of with , we have: By coercivity of , we have Where the last inequality is due to continuity of . Now, we have Thus, we have The result follows from the triangle inequality, and taking the infimum over .   Probabilistic Bound for Monte-Carlo Consistency   Suppose that . We have that, with probability ,     We first split into compatible arguments: The remainder of this proof focuses on the second term. We have For a test function , we define the following random variables for   where are i.i.d uniform random variables on . We have As are independent uniform RVs on , this yields an unbiased estimate of the true scattering form: In order to apply Hoeffding's inequality, we must also bound these RVs. The integral inside is bounded via Cauchy-Schwarz as Thus, we have Similarly, we have Combining these, we have i.i.d. RVs bounded by We can thus apply Hoeffding's inequality, Setting gives, with probability at least , Combining with and dividing by yields the result.   Error Estimate for the Steady State    Suppose is the solution of and the solution of . Given that and , we have with probability at least      The result follows from combining and . We have, with probability  Rearranging for gives the result.    FE Source Iteration Error  The adjustments required for our previous source iteration analysis are comparatively straightforward. Indeed, appears in both and , meaning we don't have to use a Monte Carlo consistency bound as for the steady state error analysis.  Instead, all that is needed for our convergence results ( and ) to carry over is that admits a continuity result equivalent to . By bounding above by its infinity-norm evaluated everywhere on the domain, we arrive at the following: where This leads directly to an extension of .   Convergence in SUPG-Norm with MC Approximation    Let be the solution of , arbitrary and the sequence defined by . Given , we have for all ,     The proof is identical to that of , using in place of .    Combined Error Estimate  We now combine these strands into a single error estimate.   Error Estimate with Monte Carlo Integration   Suppose is the solution of . Let be the solution of , arbitrary and the sequence defined by . Given , we have for all , with probability ,   Similar to , the result follows from splitting with the triangle inequality , then applying and .   "
},
{
  "id": "thm-strang",
  "level": "2",
  "url": "sec-fem-mc-sto.html#thm-strang",
  "type": "Theorem",
  "number": "1.6.1",
  "title": "Strang-Type Error Estimate.",
  "body": " Strang-Type Error Estimate   Let be the solution of and the solution of . Then,  "
},
{
  "id": "subsec-fe-sto-4",
  "level": "2",
  "url": "sec-fem-mc-sto.html#subsec-fe-sto-4",
  "type": "Proof",
  "number": "1.6.2.1",
  "title": "",
  "body": "Let be arbitrary. We define . By and by definition of , we have that Splitting the first argument of with , we have: By coercivity of , we have Where the last inequality is due to continuity of . Now, we have Thus, we have The result follows from the triangle inequality, and taking the infimum over . "
},
{
  "id": "prop-prob-bound",
  "level": "2",
  "url": "sec-fem-mc-sto.html#prop-prob-bound",
  "type": "Proposition",
  "number": "1.6.2",
  "title": "Probabilistic Bound for Monte-Carlo Consistency.",
  "body": " Probabilistic Bound for Monte-Carlo Consistency   Suppose that . We have that, with probability ,    "
},
{
  "id": "subsec-fe-sto-6",
  "level": "2",
  "url": "sec-fem-mc-sto.html#subsec-fe-sto-6",
  "type": "Proof",
  "number": "1.6.2.2",
  "title": "",
  "body": "We first split into compatible arguments: The remainder of this proof focuses on the second term. We have For a test function , we define the following random variables for   where are i.i.d uniform random variables on . We have As are independent uniform RVs on , this yields an unbiased estimate of the true scattering form: In order to apply Hoeffding's inequality, we must also bound these RVs. The integral inside is bounded via Cauchy-Schwarz as Thus, we have Similarly, we have Combining these, we have i.i.d. RVs bounded by We can thus apply Hoeffding's inequality, Setting gives, with probability at least , Combining with and dividing by yields the result. "
},
{
  "id": "cor-mc-ss-err",
  "level": "2",
  "url": "sec-fem-mc-sto.html#cor-mc-ss-err",
  "type": "Corollary",
  "number": "1.6.3",
  "title": "Error Estimate for the Steady State.",
  "body": " Error Estimate for the Steady State    Suppose is the solution of and the solution of . Given that and , we have with probability at least     "
},
{
  "id": "subsec-fe-sto-8",
  "level": "2",
  "url": "sec-fem-mc-sto.html#subsec-fe-sto-8",
  "type": "Proof",
  "number": "1.6.2.3",
  "title": "",
  "body": "The result follows from combining and . We have, with probability  Rearranging for gives the result. "
},
{
  "id": "cor-conv-supg-MC",
  "level": "2",
  "url": "sec-fem-mc-sto.html#cor-conv-supg-MC",
  "type": "Corollary",
  "number": "1.6.4",
  "title": "Convergence in SUPG-Norm with MC Approximation.",
  "body": " Convergence in SUPG-Norm with MC Approximation    Let be the solution of , arbitrary and the sequence defined by . Given , we have for all ,    "
},
{
  "id": "subsec-iter-sto-5",
  "level": "2",
  "url": "sec-fem-mc-sto.html#subsec-iter-sto-5",
  "type": "Proof",
  "number": "1.6.3.1",
  "title": "",
  "body": "The proof is identical to that of , using in place of . "
},
{
  "id": "thm-sto",
  "level": "2",
  "url": "sec-fem-mc-sto.html#thm-sto",
  "type": "Theorem",
  "number": "1.6.5",
  "title": "Error Estimate with Monte Carlo Integration.",
  "body": " Error Estimate with Monte Carlo Integration   Suppose is the solution of . Let be the solution of , arbitrary and the sequence defined by . Given , we have for all , with probability ,  "
},
{
  "id": "subsec-combined-sto-4",
  "level": "2",
  "url": "sec-fem-mc-sto.html#subsec-combined-sto-4",
  "type": "Proof",
  "number": "1.6.4.1",
  "title": "",
  "body": "Similar to , the result follows from splitting with the triangle inequality , then applying and . "
},
{
  "id": "sec-fem-mc-numerics",
  "level": "1",
  "url": "sec-fem-mc-numerics.html",
  "type": "Section",
  "number": "1.7",
  "title": "Numerical Experiments",
  "body": " Numerical Experiments     Introduction  We validate the theoretical convergence rates established in and through a series of numerical experiments, considering both deterministic (exact) and Monte Carlo evaluation of the scattering operator. All experiments use the method of manufactured solutions on the unit square, with parameters fixed as follows:                      The source is chosen so that the exact solution is and the inflow data is . We consider only the unit kernel , for which the scattering integral reduces to - a scalar independent of . Although this may seem a substantial simplification, we have found empirically that Gaussian kernels exhibit the exact same convergence characteristics (as to be expected, as this only impacts the constants of the convergence results).  Thus, we have Therefore, we have whenever . Hence, for a uniform square mesh on , and apply whenever the grid size is greater than . Finally, we note that all implementations use elements, setting in the aforementioned theorems.    Deterministic Case  We first validate the source iteration convergence result of . In , we see the iterative scheme on a mesh and a mesh, each showing an initial convergence rate greater than - faster even than , hinting at the slack in our estimates.  This continues until the discretisation error starts to dominate. Indeed, by plotting the full error , the early stages demonstrate iteration error convergence with negligible discretisation error, while convergence stagnates once iteration error falls below discretisation error. We are effectively viewing the triangle inequality The stagnation in occurs later on the finer mesh, consistent with its smaller discretisation error, and the error floor is lower by a factor of approximately , in agreement with the rate in .    -norm error against iteration count for source iteration on a mesh (top) and a mesh (bottom) on with unit kernel and exact (quadrature-based) evaluation of the scattering operator. The graphs show the sequence initialised with , and the orange dashed line indicates the theoretical bound .         validates , which predicts that the discretisation error decays at rate for elements in the SUPG norm. For each value of , we run source iterations initialised at and record the error . The choice is justified by : for all mesh sizes considered, the iteration error has already fallen well below the discretisation error by the tenth iteration, so the plotted quantity is an accurate proxy for . The observed slope is in exact agreement with the theoretical rate , confirming the sharpness of the interpolation-based estimate in .   Convergence of the finite element discretisation for increasingly refined uniform square meshes on with unit kernel and deterministic scattering (computed with quadrature). For each mesh (value of ), the ten source iterations are performed before moving to the next refinement. The graph shows the sequence and is initialised on each mesh with .       Stochastic Case  We now introduce Monte Carlo estimation of the scattering operator and examine its effect on both the iteration convergence and the mesh refinement study.  overlays the deterministic and stochastic ( ) iteration error curves for the and meshes. The MC estimator introduces a noise floor at approximately : once the iteration error falls to this level, further iterations no longer reduce the total error, and the curve stagnates earlier than in the deterministic case. This is consistent with the Strang estimate of , in which the MC consistency error contributes a term of order independently of . The stagnation level is comparable across both meshes, confirming that the MC error dominates once the discretisation error falls below .   -norm error against iteration count for source iteration on a mesh (top) and a mesh (bottom) on with unit kernel . Exact (quadrature-based) computation of the scattering operator is shown in blue, with orange representing Monte Carlo estimation of the scattering operator, with . The graphs show the sequence initialised with , and the green dashed line indicates the theoretical bound .         repeats the mesh refinement study of with MC estimation of the scattering operator ( ). For coarse meshes, where the discretisation error exceeds the MC noise floor, the expected rate is recovered. As decreases and approaches , the MC consistency error begins to dominate and the convergence curve flattens and becomes irregular. This saturation is precisely what the Strang estimate predicts: once the best-approximation term is smaller than the MC term, further mesh refinement yields no improvement without a corresponding increase in . The persistent downward trend visible even in the irregular regime reflects the decreasing discretisation error floor, but finer meshes are increasingly dominated by the consistency error.   Convergence of the finite element discretisation for increasingly refined uniform square meshes on with unit kernel and Monte Carlo estimation of the scattering operator, with . For each mesh (value of ), the ten source iterations are performed before moving to the next refinement. The graph shows the sequence and is initialised on each mesh with .}     Finally, we investigate the effect of increasing Monte Carlo Samples. shows the iteration convergence plot for the case of samples. As this is a 4-fold increase, we expect to see a factor of reduction in the associated Monte Carlo error. In comparison with , we have tentative results motivating this is the case. However, this is difficult to verify as the spread of the Monte Carlo error itself ranges an order of magnitude. We leave to future work the process of averaging over multiple independent realisations to estimate the expected noise floor - which would relieve us from relying on a single sample path.   -norm error against iteration count for source iteration on a mesh (top) and a mesh (bottom) on with unit kernel . and Monte Carlo estimation of the scattering operator, with . The graphs show the sequence initialised with , and the green dashed line indicates the theoretical bound .          "
},
{
  "id": "fig-source-det-h-512",
  "level": "2",
  "url": "sec-fem-mc-numerics.html#fig-source-det-h-512",
  "type": "Figure",
  "number": "1.7.1",
  "title": "",
  "body": "  -norm error against iteration count for source iteration on a mesh (top) and a mesh (bottom) on with unit kernel and exact (quadrature-based) evaluation of the scattering operator. The graphs show the sequence initialised with , and the orange dashed line indicates the theoretical bound .        "
},
{
  "id": "fig-fe-det-h-2-512",
  "level": "2",
  "url": "sec-fem-mc-numerics.html#fig-fe-det-h-2-512",
  "type": "Figure",
  "number": "1.7.2",
  "title": "",
  "body": " Convergence of the finite element discretisation for increasingly refined uniform square meshes on with unit kernel and deterministic scattering (computed with quadrature). For each mesh (value of ), the ten source iterations are performed before moving to the next refinement. The graph shows the sequence and is initialised on each mesh with .    "
},
{
  "id": "fig-source-sto-h-512",
  "level": "2",
  "url": "sec-fem-mc-numerics.html#fig-source-sto-h-512",
  "type": "Figure",
  "number": "1.7.3",
  "title": "",
  "body": " -norm error against iteration count for source iteration on a mesh (top) and a mesh (bottom) on with unit kernel . Exact (quadrature-based) computation of the scattering operator is shown in blue, with orange representing Monte Carlo estimation of the scattering operator, with . The graphs show the sequence initialised with , and the green dashed line indicates the theoretical bound .        "
},
{
  "id": "fig-fe-sto-h-2-512",
  "level": "2",
  "url": "sec-fem-mc-numerics.html#fig-fe-sto-h-2-512",
  "type": "Figure",
  "number": "1.7.4",
  "title": "",
  "body": " Convergence of the finite element discretisation for increasingly refined uniform square meshes on with unit kernel and Monte Carlo estimation of the scattering operator, with . For each mesh (value of ), the ten source iterations are performed before moving to the next refinement. The graph shows the sequence and is initialised on each mesh with .}    "
},
{
  "id": "fig-source-sto-h-512-40000",
  "level": "2",
  "url": "sec-fem-mc-numerics.html#fig-source-sto-h-512-40000",
  "type": "Figure",
  "number": "1.7.5",
  "title": "",
  "body": " -norm error against iteration count for source iteration on a mesh (top) and a mesh (bottom) on with unit kernel . and Monte Carlo estimation of the scattering operator, with . The graphs show the sequence initialised with , and the green dashed line indicates the theoretical bound .        "
},
{
  "id": "sec-fem-mc-conclusion",
  "level": "1",
  "url": "sec-fem-mc-conclusion.html",
  "type": "Section",
  "number": "1.8",
  "title": "Conclusion",
  "body": " Conclusion    This report has developed a numerical analysis framework for a hybrid deterministic-stochastic scheme applied to a stationary linear transport equation with nonlocal scattering. The scheme combines an SUPG-stabilised finite element discretisation of the spatial transport operator with a Monte Carlo approximation of the scattering integral, embedded within a source iteration to decouple the dense nonlocal coupling at each step.  We have presented three main analytical contributions. First, in the deterministic setting ( ), we established a C\\'{e}a-type best-approximation estimate for the SUPG variational formulation under the sharp continuity condition $C_s \\lt \\tfrac{1}{2}$ on the scattering operator, and proved that source iteration contracts at a mesh-independent rate $(2C_s)^n$. These combine via the triangle inequality to give an explicit convergence rate of $\\mathcal{O}(h^{k+1\/2})$ in the SUPG norm, with iteration error decaying geometrically. Second, in the stochastic setting ( ), we derived a Strang-type error estimate that cleanly separates the finite element approximation error from the Monte Carlo consistency error, and obtained a probabilistic bound on the latter via Hoeffding's inequality. The resulting estimate explicitly states the interplay between mesh size $h$, sample size $M$, and iteration count $n$ in this class of schemes, and bounds $\\enorm{u - u_h^{(n)}}$ with prescribed confidence $1 - \\eta$. Third, the analysis identifies the subcriticality condition $C_s \\lt \\tfrac{1}{2}$ as the single hypothesis underlying \\emph{both} well-posedness of the discrete problem and contraction of the iteration.  The numerical experiments in validate the predicted rates. The $\\mathcal{O}(h^{3\/2})$ discretisation error rate for $P^1$ elements was recovered exactly in the deterministic case, and the Monte Carlo noise floor was observed to dominate at fine mesh sizes in agreement with the Strang estimate. The observed contraction rate of source iteration was markedly faster than the theoretical bound $(2C_s)^n$, suggesting this bound may potentially be tightened. One obvious strategy is to keep hold of factors of $\\delta_K$ in our analysis, another is to consider the spectral radius of the iteration operator, rather than its operator norm.  Further research has been motivated on the following six points:    Parameter selection The error decomposition in naturally lends itself to a parameter tuning procedure: given a computational budget, the three terms (discretisation, iteration, Monte Carlo) can be balanced to minimise the total error bound. Automating this for practical use is an immediate next step.     Higher dimensions and complex geometries In the two-dimensional setting considered here, deterministic quadrature is strictly more efficient than Monte Carlo for the scattering integral, and our contraction results in fact hold for any positively weighted quadrature rule. The motivation for Monte Carlo lies in higher-dimensional phase-space settings (with angular and energy variables) and on complex geometries where deterministic quadrature becomes prohibitive. Extending the analysis to such settings, including coupling with discrete-ordinates angular discretisations, is a natural continuation.     Nonhomogeneous inflow data The deterministic analysis assumed $g = 0$ for simplicity. Extending to general $g \\in L^2(\\Gamma_-)$ requires a more advanced analysis, with careful treatment of trace operators.     Sharper probabilistic bounds Hoeffding's inequality gives a worst-case tail bound that is sharp in $M$ but conservative in the dependence on the boundedness constant $B$. Alternatively, an analysis bounding the expected error $\\mathbb{E}\\,\\enorm{u - u_h^{(n)}}$ rather than a high-probability event would avoid the $\\sqrt{\\log(1\/\\eta)}$ factor.     Variance reduction The naive Monte Carlo estimator used here is the simplest possible choice. Importance sampling, stratified sampling, or quasi-Monte Carlo would reduce the effective constant $B$ in the consistency bound by orders of magnitude in typical shielding configurations, and the analysis framework developed here may be extended to such strategies. Importance sampling that makes use of the previous guess is also of interest.     Numerical experiments. The experiments presented are simplistic, for the purpose of validating the analysis on a manufactured solution with a unit kernel. Extending to Gaussian and algebraically decaying kernels, test problems motivated by shielding applications, and taking averages over multiple Monte Carlo realisations to estimate the expected noise floor, are all natural next steps. Larger-scale experiments with a substantial computational budget would also help to verify the asymptotic balance between $h$, $n$, and $M$ predicted by .   Overall, the analysis presented in this report provides a rigorous foundation for hybrid finite element-Monte Carlo methods in radiation transport, identifying the key constants and rates that govern their behaviour and providing theory for principled algorithm development in complex higher-dimensional settings.  "
},
{
  "id": "sec-num-int-intro",
  "level": "1",
  "url": "sec-num-int-intro.html",
  "type": "Section",
  "number": "2.1",
  "title": "Introduction to Recombination",
  "body": " Introduction to Recombination    Given a dataset of samples, random subsampling reduces computational cost but introduces Monte Carlo noise and may distort important statistical properties such as means, variances, and correlations. Recombination, also known as measure reduction, instead constructs a reduced-complexity discrete measure from a larger measure while preserving specified integral properties of the original measure \\cite{litterer2012high}.   baryx is a Python\/JAX-oriented package for recombination \\cite{coxon2026baryx}. It replaces many equally weighted points with a smaller set of unequally weighted points while preserving user-specified statistics exactly, up to selected higher-order moments within numerical tolerance. The library provides efficient, hardware-accelerated tools for this purpose, with a particular emphasis on barycentre preservation, which plays a fundamental role in areas such as computational statistics, optimal transport, and numerical integration.  This report forms part of a broader group effort to explore applications of the baryx library, covering data compression with feature preservation, statistical bootstrapping via random subsampling, and numerical integration. Here, we consider the last of these applications: the use of recombination for numerical integration.    Numerical Integration  Constructing efficient quadrature and cubature rules has long been a central challenge in computational mathematics \\cite{engels1980numerical}. Many problems of practical interest lack closed-form solutions, among them integral transforms, ODE solution operators, and cumulative probability distributions. In the Finite Element Method, for instance, quadrature must be evaluated repeatedly over many elements, making efficiency especially desirable even on complex or high-dimensional domains. In this report, we explore the use of the recombination algorithm in baryx to improve quadrature efficiency while preserving accuracy and expressiveness. A concise, general view of numerical integration is to \"approximate, then integrate\": a perspective that also encompasses Monte Carlo methods \\cite{nakatsukasa2018approximate}. Given an integrand , we construct an approximate polynomial through interpolation, and integrate exactly using a quadrature rule. While the first step is treated as given, this report focuses on the second: constructing efficient quadrature rules for .  The action of recombination in this context is to compress the quadrature rule while preserving its degree of precision. That is, given a quadrature rule with degree of precision (DoP) satisfying recombination finds a reweighted subset such that still holds \\cite{tchernychova2016caratheodory}.  We note that this reweighted subset can only provide a quadrature rule of the same or lower DoP of the original rule. Thus, a fundamental consideration in the implementation of baryx is to begin with an overdetermined quadrature rule of sufficiently high DoP, which recombination can then compress into a smaller, equally precise rule.  We demonstrate that recombination performs well on complex 2D domains, reducing any cubature of DoP to nodes. In higher dimensions, recombination effectively compresses Cartesian-product Gaussian quadrature rules even on simpler domains such as the hypercube. These results motivate the use of baryx , an efficient implementation of recombination, in resource-intensive applications such as the Finite Element Method.  The remainder of this report is organised as follows. In Section 2, we provide background on numerical integration and quadrature rules in one and two dimensions. In Section 3, we develop a general framework for applying recombination to quadrature rules and demonstrate it on simple and complex 2D domains. We derive an upper bound on the node count in terms of the target DoP, and show how suitable modifications that exploit symmetry improve this bound for odd DoP. Finally, we extend the original bound to higher-dimensional domains.   "
},
{
  "id": "sec-num-int-prelim",
  "level": "1",
  "url": "sec-num-int-prelim.html",
  "type": "Section",
  "number": "2.2",
  "title": "Preliminaries",
  "body": " Preliminaries   Introduction  The aim of numerical integration is to approximate the integral where (predominantly ) and . We focus on quadrature rules, which approximate the integrand by a polynomial and integrate exactly: A quadrature rule has an associated degree of precision (DoP) , meaning all polynomials of degree are integrated exactly. In this section, we provide a background on constructing quadrature rules to a specified DoP. We begin with the well-understood 1D case before turning to the more involved problem of quadrature in 2D.    Quadrature in 1D   Introduction  In the following, we take , so . For a quadrature rule to have DoP , we require for all . By linearity of integration, it suffices to check this over a basis of . A natural choice is the monomial basis , resulting in the \\textit{momentum equations} \\cite{engels1980numerical} (also referred to as moment matching equations \\cite{tchernychova2016caratheodory}) where are distinct evaluation points, are their associated weights and Writing explicitly, we have The task of constructing a quadrature rule with DoP is to solve this system for evaluation points and weights.    Fixed Nodes  We first consider fixed evaluation points. Setting results in an exactly-determined linear system in the weights , as in . This results in a quadrature rule of DoP with nodes. A special case arises through considering an odd number of symmetric evaluation points. Suppose we have points , with and for all . The system becomes By further imposing symmetric weights , the odd-power equations are automatically satisfied, since and , consistent with . The even-power equations reduce to where the unknowns can be determined exactly from linear equations. Thus, the derived weights solve with DoP . Moreover, as all odd-power integrands zero out, the rule in fact achieves DoP .  Thus, for evaluation points, enforcing weight symmetry achieves DoP . In the case of equidistant points, this derives Newton-Cotes quadrature rule, while for Chebyshev points, this gives us the Clenshaw-Curtis quadrature rule \\cite{clenshaw1960method}.    Free Nodes  We return to the momentum equations and consider the case where both nodes and weights are free parameters. We show that the nodes can be chosen as roots of a suitable polynomial, which underpins the construction of Gaussian quadrature rules~\\cite{engels1980numerical}.  We want to find unknowns: nodes and weights . Let be the unique monic polynomial of degree with roots : Multiplying the th momentum equation in by for each gives us Adding these equations together for all , we have Since for all , the left-hand side vanishes, arriving at  Repeating this argument for shifts - multiplying the th momentum equation by and summing - we arrive at the linear system or in matrix form, This determines the unique set of coefficients , from which the roots of are found. With the nodes determined, the weights follow from previous argument for with fixed nodes. The above process constructs Gauss-Legendre quadrature, with nodes found to be roots of degree Legendre polynomial~\\cite{engels1980numerical}. More generally, introducing a weight function into the integrand leads to other Gaussian quadrature rules, with nodes given by roots of the corresponding polynomials. This includes Gauss-Chebyshev (Chebyshev polynomials), Gauss-Jacobi, Gauss-Laguerre, and Gauss-Hermite quadrature~\\cite{engels1980numerical}.     Cubature in 2D  We now consider cubature rules for domains . Constructing efficient cubature rules in 2D is significantly more challenging than in 1D and remains an active area of research~\\cite{bauman2020compressed}. We demonstrate this with the example of the \"plus\" domain, composed of unit squares ( ).   Diagram of simple 2D quadrature of DoP 1 on the plus domain.     A natural starting point is geometric construction~\\cite{engels1980numerical}. In the plus domain is tessellated with 10 identical triangles, and a quadrature rule is constructed by assigning each vertex a weight proportional to the total area of incident triangles. Vertices labelled are incident to one triangle, to two, to 4 and to five, giving Here, is the area of each triangle, and each triangle contributes the average of at its three vertices. This rule has DoP 1 by construction, integrating linear functions exactly, but not quadratics.  This is a far cry from the efficiency of quadrature rules in 1D. In Gaussian quadrature, nodes yield DoP , whereas here 12 nodes achieve only DoP 1. Treating these as fixed nodes, 12 weights can satisfy 12 momentum equations. Since DoP requires momentum equations, this corresponds to at most DoP 3. However, the difficulty of constructing efficient cubature rules in 2D is due to the potential complexity of the domain. Unlike a line segment, momentum integrals over a general may be difficult or impossible to evaluate analytically, making it impractical to assemble the momentum equations needed to find suitable nodes and weights.  For rectangular domains, higher DoP can be achieved by extending 1D quadrature rules along each axis via Cartesian products~\\cite{tchernychova2016caratheodory} (also called tensor products~\\cite{trefethen2017cubature}). For a Gaussian quadrature rule with DoP , we have that This yields a cubature rule with DoP on the rectangular domain using nodes. We will refer to this as Gaussian cubature.  One option for complex domains is to tessellate with rectangles and apply Gaussian cubature to each, giving a patchwork of cubature rules, as illustrated in . Although it has been shown that Gaussian cubature rules can be constructed directly for any polygonal domain~\\cite{sommariva2007product}, tessellation remains a practical approach for non-polygonal, irregular or disconnected domains.   Diagram of a 2D Gaussian cubature rule of DoP 3 on the plus domain.       Higher Dimensions  We briefly discuss cubature in higher dimensions. For rectangular domains, a Cartesian-product Gauss-Legendre rule achieves DoP in dimensions using nodes. However, this count grows exponentially with , making it impractical for high dimensions and motivating the use of recombination to compress such rules, as discussed in Section~3.4.  Alternative approaches include sparse grids and Monte Carlo methods~\\cite{trefethen2017cubature}. Sparse grids use a hierarchical construction to reduce the node count, but the exponential scaling persists in the worst case. Monte Carlo methods achieve a convergence rate independent of dimension, at the cost of stochastic noise and potentially many samples for high accuracy.    "
},
{
  "id": "fig-triangle",
  "level": "2",
  "url": "sec-num-int-prelim.html#fig-triangle",
  "type": "Figure",
  "number": "2.2.1",
  "title": "",
  "body": " Diagram of simple 2D quadrature of DoP 1 on the plus domain.     "
},
{
  "id": "fig-gaussian",
  "level": "2",
  "url": "sec-num-int-prelim.html#fig-gaussian",
  "type": "Figure",
  "number": "2.2.2",
  "title": "",
  "body": " Diagram of a 2D Gaussian cubature rule of DoP 3 on the plus domain.     "
},
{
  "id": "subsec-cubature-10",
  "level": "2",
  "url": "sec-num-int-prelim.html#subsec-cubature-10",
  "type": "Remark",
  "number": "2.2.3",
  "title": "Higher Dimensions.",
  "body": " Higher Dimensions  We briefly discuss cubature in higher dimensions. For rectangular domains, a Cartesian-product Gauss-Legendre rule achieves DoP in dimensions using nodes. However, this count grows exponentially with , making it impractical for high dimensions and motivating the use of recombination to compress such rules, as discussed in Section~3.4.  Alternative approaches include sparse grids and Monte Carlo methods~\\cite{trefethen2017cubature}. Sparse grids use a hierarchical construction to reduce the node count, but the exponential scaling persists in the worst case. Monte Carlo methods achieve a convergence rate independent of dimension, at the cost of stochastic noise and potentially many samples for high accuracy.  "
},
{
  "id": "sec-num-int-rec",
  "level": "1",
  "url": "sec-num-int-rec.html",
  "type": "Section",
  "number": "2.3",
  "title": "Applying Recombination",
  "body": " Applying Recombination   Introduction  The recombine algorithm in baryx takes a weighted point cloud in and returns a reweighted set of at most points with the same barycentre (centre of mass) as the original set. Additional properties of the dataset can be preserved by extending the dimensions of the data to include its moments. For example, sample variance can be preserved by appending to each point . This embeds the data in , after which recombination produces a reweighted set of at most points. The first components of these points then form a mean- and variance-preserving coreset of the original point cloud.  In the context of numerical integration, recombination compresses quadrature rules by viewing the right-hand side of the momentum equations as a barycentre preserved under reweighted downsampling. In this work, recombination is not used to construct or extend the degree of precision: the resulting rule can be at most as expressive as the original quadrature rule provided to it.  In this section, we develop a general framework for compressing quadrature rules using recombination and demonstrate its application to two-dimensional quadrature on simple and more complex domains. We derive an upper bound on the number of nodes produced by recombination in terms of the target DoP, and provide an alternative framework which improves this bound for odd DoP on domains invariant under reflection through the origin. Finally, we extend the first result to higher-dimensional domains.    General Framework for Recombination on Cubature  Suppose we are given a cubature rule with DoP on , with nodes and weights . The aim is to compress the rule - that is, reduce the number of nodes - while achieving a target DoP . Let denote the space of polynomials of degree at most on . We take to be a basis for , where We construct a set of vectors in given by equipped with the original weights .  We then apply recombination to this set, obtaining a coreset of at most reweighted vectors. This subset preserves the barycentre of the original data. In particular, for each , % where is the where the final equality follows from the definition of the original quadrature rule. Thus, all momentum equations required for DoP are satisfied by the new quadrature rule, comprising nodes and weights .  We highlight two caveats for practical implementation. First, in baryx , the size of the recombined coreset is observed to be , rather than . Although the internal procedures of baryx are beyond the scope of this report, this behaviour is motivated by considering as a linear system of weights with fixed nodes . Moreover, \\cite{tchernychova2016caratheodory} shows that Carath\\'eodory cubature - the cubature found by recombination - has cardinality (number of nodes) bounded above by .  Second, recombination requires a sufficiently accurate, pre-existing cubature rule to be simplified. Univariate quadrature rules can be extended to higher dimensional rectangular domains through Cartesian products, while retaining their degree of precision \\cite{tchernychova2016caratheodory}. In two dimensions, Gaussian cubature can be found for all polygons \\cite{sommariva2007product}. This leads us to the approach later employed in experiments: tessellating a more complicated domain with simpler shapes before applying recombination to a patchwork of cubature rules.    Square Domains  We begin with the simple case of applying recombination on the domain . shows Gauss-Legendre cubature compressed to a triangular number of nodes, corresponding to the number of momentum equations that must be satisfied. Indeed, from with , the number of nodes produced after recombination is where is the target degree of precision.  A closer inspection of shows that, in this domain, recombined cubature cannot compete with standard Gauss-Legendre cubature. In the middle column, we see that a recombined cubature of degree 2 requires 6 nodes, while the left column shows Gauss-Legendre cubature achieves degree 3 using only four nodes. In general, a two-dimensional Gauss-Legendre cubature of nodes has degree of precision . That is, achieving degree of precision on requires only nodes. Thus, for all and there is no guaranteed improvement from recombination.              Gauss-Legendre cubature recombined on the unit square. The left column shows a degree 3 cubature compressed to degree 1. The middle column shows a degree 5 cubature compressed to degree 2. The right column shows a degree 17 cubature compressed to degree 5.           For odd , certain modifications to our framework can improve the efficiency of the resulting cubature. We consider the domain , which has the advantage that all odd-order polynomials integrate to zero (a property of any domain invariant under reflection through the origin \\cite{stroud1971approximate}).  Contrary to our previous framework, we consider a basis of only the even-order polynomials of degree . Thus, we have   The resulting nodes are then reflected through the origin, attributing the same weights to their reflections. We then halve all of the weights. This produces a quadrature rule with nodes; an example for is shown in . For odd , this improves upon the original recombined cubature by reducing the node count from to . However, the resulting rule still requires double the nodes as Gauss-Legendre cubature, while the node count for even increases to .  While recombination is uncompetitive on simple rectangular domains, it becomes valuable for complex 2D geometries and high-dimensional hypercubes. These settings are explored in the following two sections.   Compression from degree- to degree- polynomials using points, compared with points in . The blue points are obtained by recombination on the space of even-degree polynomials of degree at most , and the orange points are their reflections through the origin. Weights are shared between a blue point and its reflected orange counterpart, and normalised.           Tessellation and General 2D Domains  We now consider more complex domains in . As noted previously, exact momentum integrals may be unavailable for general domains, so constructing cubature rules directly from momentum equations is often infeasible. Furthermore, tensor-product quadrature rules no longer apply on non-rectangular domains, though Gaussian cubature rules for polygons have been developed \\cite{sommariva2007product}.  Our approach is to instead tessellate a domain into simpler subdomains, producing a patchwork of local cubature rules. Applying recombination to this patchwork yields a single cubature rule with the same degree of precision and significantly fewer nodes.   Compression on the \"plus\", \"lattice\" and France domains, with selected nodes shown in orange. In each example, a patchwork of DoP 3 cubature is compressed to 10 nodes through recombination.           To illustrate this approach, we present three examples of increasing geometric complexity, each tessellated using DoP 3 Gauss-Legendre cubature, shown in .  We first consider the “plus” domain introduced previously in . Recombination compresses the resulting -node quadrature rule to nodes, as predicted by . We then apply the same procedure to a lattice domain inspired by geometries arising in microwave shielding simulations \\cite{samoh2021simulation}. Again, recombination reduces the -node patchwork cubature to a -node rule.  Finally, we tessellate mainland France using subdomains of area . The coastline is approximated by selecting grid cells that intersect the domain. Recombination again produces a degree- cubature rule with only nodes, this time compressing an initial rule consisting of nodes.    Higher Dimensions  For one- and two-dimensional domains, we have seen that recombination fails to compress Gauss-Legendre quadrature on intervals and its Cartesian-product cubature extensions on rectangles. We conclude with the observation that this behaviour does not persist in higher dimensions.  Indeed, on the domain with target degree of precision , recombination compresses a cubature rule to nodes. By contrast, the Cartesian-product extension of Gauss--Legendre quadrature yields a cubature rule with nodes. For , the same behaviour as in the cases persists: Gauss-Legendre cubature is not compressible via recombination, since However, for , this inequality reverses for sufficiently large . At leading order, as , so . Since for , we have that asymptotically, and recombination can compress Gauss-Legendre cubature on hypercubes in four or more dimensions. In fact, the crossover happens early: for , for all even and for odd , with the crossover occuring at lower for higher .   "
},
{
  "id": "fig-compression",
  "level": "2",
  "url": "sec-num-int-rec.html#fig-compression",
  "type": "Figure",
  "number": "2.3.1",
  "title": "",
  "body": "          "
},
{
  "id": "fig-compression-2",
  "level": "2",
  "url": "sec-num-int-rec.html#fig-compression-2",
  "type": "Figure",
  "number": "2.3.2",
  "title": "",
  "body": " Gauss-Legendre cubature recombined on the unit square. The left column shows a degree 3 cubature compressed to degree 1. The middle column shows a degree 5 cubature compressed to degree 2. The right column shows a degree 17 cubature compressed to degree 5.          "
},
{
  "id": "fig-reflected",
  "level": "2",
  "url": "sec-num-int-rec.html#fig-reflected",
  "type": "Figure",
  "number": "2.3.3",
  "title": "",
  "body": " Compression from degree- to degree- polynomials using points, compared with points in . The blue points are obtained by recombination on the space of even-degree polynomials of degree at most , and the orange points are their reflections through the origin. Weights are shared between a blue point and its reflected orange counterpart, and normalised.        "
},
{
  "id": "fig-plus",
  "level": "2",
  "url": "sec-num-int-rec.html#fig-plus",
  "type": "Figure",
  "number": "2.3.4",
  "title": "",
  "body": " Compression on the \"plus\", \"lattice\" and France domains, with selected nodes shown in orange. In each example, a patchwork of DoP 3 cubature is compressed to 10 nodes through recombination.          "
},
{
  "id": "sec-num-int-conc",
  "level": "1",
  "url": "sec-num-int-conc.html",
  "type": "Section",
  "number": "2.4",
  "title": "Conclusion",
  "body": " Conclusion  Recombination compresses quadrature rules effectively in settings where standard constructions are unavailable or inefficient - namely complex 2D domains and hypercubes in four or more dimensions. We have developed a general framework for applying recombination to quadrature rules and demonstrated it on simple and complex two-dimensional domains. For a target DoP on an -dimensional domain, recombination produces a quadrature rule with at most nodes. For the case of odd on two-dimensional domains invariant under reflection through the origin, we have shown that this can be improved to .  For intervals and rectangular domains in one, two, and three dimensions, recombination does not improve upon Gauss-Legendre quadrature or its tensor-product extensions. However, in four or more dimensions, recombination can compress tensor-product Gauss-Legendre cubature rules, reducing the node count while preserving the DoP. In lower dimensions, recombination also compresses patchwork cubature rules on complex geometries, as demonstrated on the \"plus\", \"lattice\", and France domains.  Future work includes deriving error bounds for general integrands, extending polygonal Gaussian rules and higher-dimensional domains to the current framework, and generalising the reflection symmetry analysis to obtain bounds in higher dimensions. A natural extension would also be to evaluate recombined cubature rules against alternative approaches to high-dimensional integration, such as sparse grids, low-rank compression, and Monte Carlo methods~\\cite{trefethen2017cubature}.  Another area of interest is to improve our implementation to construct an appropriate mesh for the domain, rather than relying on grid intersections. To further avoid dominating geometry errors, future work could also implement cubature rules for curved domains.  In the context of the wider group's work on baryx , further directions include variance reduction for Monte Carlo integration via recombination-based subsampling, and the investigation of cubature rules for kernels arising in Fourier features~\\cite{hayakawa2022positively} - used in our work on feature preservation.  "
},
{
  "id": "ch-ml-3",
  "level": "1",
  "url": "ch-ml-3.html",
  "type": "Section",
  "number": "3.1",
  "title": "Introduction",
  "body": "Introduction   Recent advances in machine learning have significantly reshaped the landscape of medium-range weather forecasting. In particular, neural operator methods, graph neural networks, and large-scale generative models have demonstrated competitive performance compared to traditional numerical weather prediction systems. Once trained, machine learning models can generate forecasts orders of magnitude faster than classical physics-based solvers, a key aspect which has effectively democratised access to high quality weather prediction \\cite{kossaifi2026demystifying}.  Despite this progress, the current literature remains fragmented. A wide variety of architectures, training strategies, and probabilistic formulations have emerged, often developed in isolation and evaluated under inconsistent experimental settings. While many models report improvements over established baselines such as the Integrated Forecasting System (IFS), differences in evaluation metrics and implementation details make systematic comparison challenging. Furthermore, the increasing architectural complexity of state-of-the-art systems introduces significant engineering overhead, which can hinder reproducibility and scalable deployment.  In response to this, Kossaifi et al. (2026) propose ATLAS (Atmospheric Transformer in Latent Space), a conceptual design framework for medium-range weather prediction. This pipeline is constituted by three conceptual components: (i) a latent space representation of high-resolution atmospheric fields, (ii) a probabilistic model governing temporal evolution in latent space, and (iii) a decoder that reconstructs full-resolution physical predictions. This decomposition provides architectural flexibility and conceptual clarity, while demonstrating state-of-the-art performance, superseding classical numerical weather prediction.  This report aims to communicate the underlying mechanisms of the ATLAS framework by presenting an example end-to-end implementation. We motivate the principal design choices and discuss appropriate metrics for evaluating and comparing such models in future research.  "
},
{
  "id": "ch-ml-4",
  "level": "1",
  "url": "ch-ml-4.html",
  "type": "Section",
  "number": "3.2",
  "title": "Problem Formulation",
  "body": "Problem Formulation  Consider a -dimensional, discrete stochastic process , where is the number of physical quantites relating to the state of the system. Our problem is to find from a single realisation of . Assuming stationarity of , we have That is, the conditional probability is independent of time. This reduces the task to learning a model for , with training data in the form of (stationary) realisations of the distribution , Equipped with such a model, we may generate an interate from an initial measurement , as an approximate sample from the distribution Taking as the inital measurement again we generate . Repeating this gives us an \"unrolled\" forecast for the initial measurement .  We note two important caveats to this formulation. First, is only approximately distributed according to , introduciing a distributional shift at each unrolling step. A would-be concern of this characteristic is the compounding of errors at each time step, however, the architectures discussed are sufficiently robust to distribution shift to produce stable forecasts up to 15 days. Second, the assumption of stationarity is not strictly valid for atmospheric data. Weather variability exhibits pronounced diurnal and seasonal cycles, leading to time-dependent dynamics. This mismatch is mitigated by conditioning the model on physically meaningful covariates that encode temporal information, such as the cosine of the solar zenith angle. Spatial non-stationarity is addressed similarly, through the inclusion of variables such as surface geopotential and land–sea masks in the projection mapping.  "
},
{
  "id": "ch-ml-5",
  "level": "1",
  "url": "ch-ml-5.html",
  "type": "Section",
  "number": "3.3",
  "title": "Populating the ATLAS Framework",
  "body": "Populating the ATLAS Framework   Introduction  Kossaifi et al. establish a general framework for approximating the condtional distribution using diffusion transformer models, entitled ATLAS (Atmospheric Transformer in Latent Space). Rather than specifying a single architecture, ATLAS is comprised of three conceptual blocks, each of which are compatible to a variety of design choices.  These blocks correspond to the choice of the latent space, the probabilistic model defined within that space, and the decoder used to reconstruct full-resolution predictions. In this section, we traverse an example structure with design choices motivated by conceptual reasoning and empirical performance.   Block 1: Choice of Latent Space  For most models, the input data is in the form of ECMWF's ERA5 dataset, a time series of historical observations re-assimilated using IFS. This data has a quarter-degree precision, with 75 measurements attributed to each gridpoint. On a global grid (721 1440), this brings us to an input dimensionality of million. Handling this size of input directly would be computationally prohibitive. We look instead towards a latent space approach, which has proven effective for high-dimensional data in computer vision and natural language processing \\cite{kossaifi2026demystifying}. In image analysis tasks, this approach is often implemented using variational autoencoders (VAEs) where an encoder-decoder pair - often in the form of a convolutional U-Net - is trained in tandem to map inputs to a suitable low-dimensional latent space. However, standard VAEs mix infomation across all channels when passing to the latent space. This poses a challenge for geophysical data. Important structure may be lost if temporally adjacent states are mapped far apart in latent space, while projecting heterogeneous variables into a shared representation can further disrupt physical dependencies \\cite{kossaifi2026demystifying}.    Rather than a learned encoder, Kossaifi et al. propose a simple direct downsampling of the data in the form of bilinear interpolation over the spatial fields. This averages measurements taken across 4 neighbouring points, reducing the spatial resolution from quarter-degree to single-degree. The resulting latent representation has dimension , corresponding to an (almost) 16 compression.  This resolution aligns suitably with ATLAS's 6-hour timestep. On this timescale, spatial features smaller than km are known to be deterministically unpredictable \\cite{kossaifi2026demystifying}. Consequently, the information lost through this interpolation pertains only to small-scale dynamics, which are only predictable under shorter time scales.   Further, Kossaifi et al. provide empirical evidence supporting this design choice. Holding all other components of the framework fixed, it is shown that a VAE trained to minimise reconstruction error produces less accurate forcasts than a downsample-decoder pair of the same parameter budget. We note that an inherent advatage of the downsample-decoder pair is that the number of parameters saved in the absence of a learned encoder effectively doubles the computational resource for the decoder.  Block 2: The Probabilistic Model  Before introducing the probabilistic model, Kassaifi et al. outline several design choices motivated by experimental results, slightly modifying the problem as formulated in the previous section. In particular, it is found that performance improves when the model predicts residual updates rather than full states, as well as with the inclusion of one additional historical state.  For a given sampling operator , we will write a latent representation as and the residual as . Incorporating the experimentally motivated conisderations, the task of the probabilistic model is to sample from a suitable approximation of Assuming that preserves stationarity, the target distribution simplifies to  We present the stochastic interpolant (SI) approach \\cite{chen2024probabilistic} to estimate the conditional distribution. In this formulation, the target distribution is given by the solution of a neural stochastic differential equation (SDE), where the drift term is parametised by a neural network. This implementation provides a natural interpretation of the learning task: the model seeks to estimate the expected dynamical trend of the latent system.  We define the stochastic process where , is an independent -valued Wiener process and are positive continuous functions. Futher, we have the boundary conditions , , , , , and . This imposes and , in particular so that is a bridge between the point mass distribution and .  It is shown in \\cite{chen2024probabilistic} (Theorem 3.1) that the distribution of is related to the following the SDE, where the drift term is given by the minimiser of In fact, we have that for all . In particular, , allowing us to sample from this distribution by solving the SDE.  Our aim is to estimate using a neural network - conditioned on an additional historical state as motivated by empirical results. We refer to as the \\emph{prediction network} and discuss its architecture in the next section. To define an appropriate loss function, we approximate the expectation in \\ref{eqn:loss} using samples . where . Equipped with an estimate , we have the following approximate model for . For an initial measurement , we solve the SDE and expect that is an approximate sample from , since . In practice, Kassaifi at al. solve this SDE using a first-order stochastic Runge-Kutta method scheme attributed to \\cite{roberts2012modify}. In further practical considerations, Kassaifi et al. note that inputs to the prediction network are re-parametrised to have zero mean and unit variance, and that a linear schedule is used for . The prediction network itself uses the same architecture as the decoder. We provide further details and a discussion in the next section.  Block 3: Decoder and Architecture  The final component of the ATLAS framework concerns the architectures used for the prediction network and the decoder responsible for reconstructing full-resolution predictions. Motivated by recent success in imaging, both the prediction and decoder networks are implemented using a diffusion transformer (DiT) architecture \\cite{peebles2023scalable}. This however contrasts with common practice in computer vision applications, where latent diffusion models often combine a transformer generative model with a convolutional U-Net decoder. As discussed previously in the context of latent space design, Kassaifi et al. report that a fully transformer-based upsampling decoder yields significantly better performance. In fact, the reconstruction error introduced from the decoder was found to be an order of magnitude smaller than that of the probabilistic model: implying no loss in performance when mapping from the latent space back to full resolution.  Before detailing the architectures of each model, we note several design choices motivated by empirical results. Kassaifi et al. find that retaining the previous full-resolution state as an additional input for the decoder, i.e. , significantly improves reconstruction accuracy. In addition, four auxiliary channels are appended to : the land-sea mask, the sea surface temperature mask, the surface geopotential and the (date-dependent) cosine-zenith angle, each normalised to the range . These variables are introduced to mitigate effects of non-stationarity: the first three address the spatial domain, while the cosine-zenith angle accounts for temporal non-stationarity.  Moreover, due to their origins in diffusion modelling, DiT blocks naturally admit a time-conditioning parameter that varies the scale and shift of their outputs. Although the parameter is redundant in the context of a constant 6-hour timestep, it is whimsically found that fixing results in better performance than removing it entirely.  We summarise the action of the decoder with the following formulation,  Underneath this representation, we begin by appling a strided convolution to to align the spatial resolutions of and . This patches the spatial dimensions to tokens while projecting the 79 channels to an embedding dimension . Channels of are similarly expanded to an embedding dimension via a non-strided convolution. The resulting representations are then concatenated into a single object with spatial dimensions and channels. To attribute spatial information, a sine-cosine postional encoding is appended to this field before DiT blocks are applied to it. Each DiT block is modified to use local attention \\cite{hassani2023neighborhood} in a window, with minimal spherically consistant padding applied beforehand. Following the final DiT block, a local linear layer maps the resulting field back to the full resolution .  We note that Kassaifi et al. do not specify how the four additional channels are treated when it comes to unrolling a forecast. From the dimensionality of the model outputs, we infer that these variables are assumed to remain constant over a 15-day forecast. One minor tweak may be to update the cosine-zenith angle according to the date of the forecast (its slow change most likely renders this effect negligible). For implementations on finer grids, the model may benefit from updating with seasonal or tidal changes to land-sea masks, and will require source updates nonetheless with climate change.  We turn our attention to the architecture of the prediction network, . The network takes as input the noisy field together with the historical states and , all of which are . The channels of the historical states are concatenated to become , then the two objects each have a distinct strided convolution applied. (the size of these kernels is motivated by known results that such patches provide quasi-isotropic fields, desirable for acting on infomation from anisotropic longitude-latitude grids \\cite{gettelman2021machine}).  Analogous to the decoder, the resulting representations are concatenated along their channel dimensions ( ) and a sine-cosine encoding is appended, all before DiT blocks are applied - each of which are conditioned on the time passed to . Again, a final linear layer projects the resulting representation to the latent resolution .  However, a key distinction of the prediction architecture is the use of global attention, in contrast to the local attention employed in the decoder. This design is motivated by the need to capture long-range dependencies in the latent space. Indeed, Kassaifi et al. report that restricting the prediction model to local attention leads to a significant degradation in performance.   "
},
{
  "id": "ch-ml-6",
  "level": "1",
  "url": "ch-ml-6.html",
  "type": "Section",
  "number": "3.4",
  "title": "Performance, Metrics and Evaluation",
  "body": "Performance, Metrics and Evaluation   Introduction  Kassaifi et al. compare the accuracy of this implementation of ATLAS against GenCast and IFS, demonstrating strong, consistant success for ATLAS. Two main classes of evaluation are considered: qualitative assessments of spatial coherence, and statistical tests of headline score metrics. It is shown that ATLAS outperforms GenCast and IFS across these benchmarks. In addition, a spectral analysis of the kinetic energy associated with Storm Dennis shows good agreement between ATLAS and ERA5 over a 5-day forecast horizon.  In this section, we contextualise these results by examining the evaluation metrics employed, discuss alternative measures, and present recommendations for future testing. Each evaluation of statistical significance is based on the paired -test, for which we provide a background in the appendix.   Presented Metrics  Introduction  Here we discuss the metrics Kassaifi et al. present in their analysis. We would like to highlight that all of them contain typos in the current form of the paper.  In the following, we denote spatial locations (grid cells) by the index , with corresponding area weights and initialisation times by . The ground truth at time and location is denoted by , while the prediction of ensemble member is given by . The ensemble mean denoted by .   \"Fair\" Continuous-Ranked Probability Score (CRPS)  Kassaifi et al. use the \"fair\" version of CRPS, which provides an unbiased estimator of the score in the limit of infinite ensemble size, regardless of the sample size, , used in experiments \\cite{zamo2018estimation}. This provides an insightful pointwise score of distibution fit: promoting accuracy in expected value in the first term, while penalising underdispersion in the second. (in Kassaifi et al., the number 2 is missing from the denominator of the second term in the sum, compare with e.g. \\cite{zamo2018estimation}). However, for GenCast, ensembles are generated from a finite set of perturbations derived from the ERA5 Ensemble of Data Assimilations \\cite{price2023gencast}. As a result, the assumption underlying the fair CRPS is not strictly satisfied, as arbitrarily many independent samples cannot be drawn. Scaling the ensemble size involves reusing members from the EDA, introducing dependencies that are not accounted for by the fair CRPS.  Ensemble-Mean RMSE (ERMSE)  Unlike CRPS, ERMSE promotes only accuracy in expected value and is biased for finite sample size. (in Kassaifi et al., is mistakenly written in place of ).  Spread-Skill ratio (SSR)  This provides us with a direct metric for dispersion in the ensemble: for a model well-fitted to the distribution, we expect to see , while over- or underestimates correspond pleasingly to over- or underdispersion, respectively. (in Kassaifi et al., an erroneous bracket appears in the innermost sum of Spread).  Both ERMSE and CRPS provide useful headline metrics for statistical evaluation. In visualisations, SSR serves as a useful complementary diagnostic to ERMSE, offering insight into the calibration of the predictive distribution that is not apparent from RMSE alone. By contrast, CRPS aggregates multiple sources of error, making its individual contributions more difficult to interpret directly.  Finally, we note that other possible metrics for consideration include Brier skill scores, rank histograms but especially Relative Economic Value (REV) \\cite{price2023gencast}. For extreme weather events, REV provides and aggregate value of the forecast from a range of stakeholders who would act on certain predictions. In future assessments, this may prove an interesting and relevant metric for the comparison of models, especially as massive ensembles compete for better predictions of such extreme events as cyclones.    "
},
{
  "id": "ch-ml-7",
  "level": "1",
  "url": "ch-ml-7.html",
  "type": "Section",
  "number": "3.5",
  "title": "Conclusion",
  "body": "Conclusion  This report examined the ATLAS framework proposed by Kossaifi et al. as a generalist approach to medium-range weather forecasting using diffusion transformer architectures. By decomposing the forecasting pipeline into a latent space representation, a stochastic probabilistic model, and a high-resolution decoder, ATLAS provides a modular and conceptually coherent alternative to traditional numerical weather prediction systems and earlier machine learning-based approaches.  Moreover, the stochastic interpolant formulation adopted in this report establishes a direct connection between the probability distribution objective and the solution of a neural SDE, interpreting the learning task as the estimation of drift-like dynamics governing the evolution of latent weather representations. Future extensions of this approach may consider recent developments in neural SDE training efficiency, including deterministic Wiener-space cubature methods in place of explicit Brownian motion simulation \\cite{snow2025efficient}.  Overall, ATLAS represents a step towards more general, scalable, and interpretable machine learning systems for weather prediction. The use of direct bilinear downsampling, transformer-based prediction in latent space, and a fully transformer-based decoder demonstrates that state-of-the-art forecasting performance can be achieved without heavily engineered or overly complex architectural designs. Although Kossaifi et al. present multiple metrics that provide useful headline statistical evaluations, a challenge for future work is the quantitative assessment of ATLAS's ensemble predictions for extreme events. For instance, the implementation measures such as the Relative Economic Value (REV) score \\cite{richardson2000skill} applied to cyclone path prediction.  "
},
{
  "id": "ch-ml-8",
  "level": "1",
  "url": "ch-ml-8.html",
  "type": "Section",
  "number": "3.6",
  "title": "Appendix",
  "body": " Appendix  Statistical Test: Paired t-Test  Suppose we have the sample outputs at lead time of two models, and , initialised at a range of times times . Let denote the metric scores (ERMSE or CRPS) of each model at this lead time. We define paired score differences At each lead time , we test the statistical significance of score difference by accepting or rejecting the null hypothesis , via a paired -test. The test statistic is given by where is the empirical mean and is given by Under the null hypothesis, the statistic is assumed to follow a Student's -distribution with degrees of freedom. Statistical significance is evaluated via the corresponding two-sided -value, \\[ p(\\tau) = 2 \\left[ 1 - F_{T-1}\\bigl(|t(\\tau)|\\bigr) \\right], \\] where denotes the cumulative distribution function of the Student- distribution with degrees of freedom. A result is deemed statistically significant if .   "
},
{
  "id": "backmatter-2",
  "level": "1",
  "url": "backmatter-2.html",
  "type": "Colophon",
  "number": "",
  "title": "Colophon",
  "body": " This book was authored in PreTeXt .  "
}
]

var ptx_lunr_idx = lunr(function () {
  this.ref('id')
  this.field('title')
  this.field('body')
  this.metadataWhitelist = ['position']

  ptx_lunr_docs.forEach(function (doc) {
    this.add(doc)
  }, this)
})
