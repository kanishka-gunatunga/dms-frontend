import { Translate } from '@google-cloud/translate/build/src/v2';
import { NextRequest, NextResponse } from 'next/server';

const translate = new Translate({
  key: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export async function POST(req: NextRequest) {
  const { language, action, documentId } = await req.json();

  console.log(documentId)
  const pdfContext = `
  Research Proposal:
‘Working At It’ 
An exploration of the perceptions and experiences of negotiating employment and 
caring responsibilities of fathers in post-divorce/separation co-parenting situations.  
Introduction:  
Despite some thirty years of social scientific research into fatherhood and masculinity, 
and the recent increase in the public and political ‘visibility’ of fathers, key researchers 
such as Lamb (2004), Morgan (2002) and Lewis (2000) continue to argue that our 
understanding of men’s experiences as fathers remains limited. “There are substantial 
gaps in our current knowledge about fatherhood” (Lewis, 2000). One such gap is in the 
relative lack of empirical insight into the experiences of working class fathers. In 
theoretical terms fatherhood is increasingly recognised as complex and dynamic, as an 
identity and a ‘practice’ which is played out in a range of social contexts and which is 
both enabled and constrained by (often-contradictory) social institutions and norms. More 
research is needed that attempts to chart the processes by which men perceive and 
negotiate their identity and activity as fathers. In addition, a growing recognition of the 
importance and ‘reality’ of post-divorce parenting has focused both academic and 
political attention on the roles, involvement and identity of fathers after divorce or 
separation. 
`;

  console.log("action : ",action)
  console.log("language api : ",language)
 
  try {
  
    if(language === ''){
      return NextResponse.json({ response: "Please select language to continue translation." });
    } else{
      const [translatedText] = await translate.translate(pdfContext, language);

    console.log("translatedText : ",translatedText)

    return NextResponse.json({ response: translatedText });
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json({ response: "Something went wrong." }, { status: 500 });
  }
}
